import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { AppState as RNAppState, AppStateStatus } from 'react-native'
import { connectSandboxTwin } from '@/api/dtp'
import { loadMedications, saveMedications } from '@/data/storage'
import type { AppState, Medication, ConnectionState } from '@/types'

const defaultCtx: AppState = {
  twin: null,
  holon: null,
  connectionState: 'connecting',
  error: null,
  medications: [],
  symptoms: [],
  isLoading: true,
  addMedication: async () => {},
  removeMedication: async () => {},
  takeMedication: async () => {},
}

const AppContext = createContext<AppState>(defaultCtx)

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [twin, setTwin] = useState<any | null>(null)
  const [holon, setHolon] = useState<any | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [symptoms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const lastActivity = useRef<number>(Date.now())
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now()
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      setIsLoading(true)
      try {
        const stored = await loadMedications()
        if (!mounted) return
        setMedications(stored)

        const { twin: t, holon: h } = connectSandboxTwin()
        if (!mounted) return
        setTwin(t)
        setHolon(h)
        setConnectionState('connected')
      } catch (err: any) {
        if (!mounted) return
        setConnectionState('error')
        setError(err.message ?? 'Failed to connect to sandbox twin')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()

    idleTimer.current = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_TIMEOUT_MS) {
        setConnectionState('error')
        setError('Session expired. Get a fresh grant token from the Sandbox page.')
      }
    }, 60_000)

    const subscription = RNAppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') resetActivity()
    })

    return () => {
      mounted = false
      if (idleTimer.current) clearInterval(idleTimer.current)
      subscription.remove()
    }
  }, [resetActivity])

  const addMedication = useCallback(async (med: Medication) => {
    const updated = [...medications, med]
    setMedications(updated)
    await saveMedications(updated)

    if (twin) {
      twin.flag('medication', {
        code: 'medication.added',
        value: JSON.stringify({ id: med.id, name: med.name }),
      }).catch(() => {})
    }
  }, [medications, twin])

  const removeMedication = useCallback(async (id: string) => {
    const updated = medications.filter((m) => m.id !== id)
    setMedications(updated)
    await saveMedications(updated)
  }, [medications])

  const takeMedication = useCallback(async (id: string) => {
    const updated = medications.map((m) =>
      m.id === id ? { ...m, lastTaken: new Date().toISOString() } : m
    )
    setMedications(updated)
    await saveMedications(updated)
  }, [medications])

  const ctx: AppState = {
    twin,
    holon,
    connectionState,
    error,
    medications,
    symptoms,
    isLoading,
    addMedication,
    removeMedication,
    takeMedication,
  }

  return (
    <AppContext.Provider value={ctx}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}