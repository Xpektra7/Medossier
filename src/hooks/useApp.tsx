import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { AppState as RNAppState, AppStateStatus } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connectSandboxTwin } from '@/api/dtp'
import { loadMedications, saveMedications } from '@/data/storage'
import type { AppState, ConnectionState, Medication, Symptom } from '@/types'

const MED_STORAGE_KEY = 'medication-safety:medications'

const defaultState = {
  twin: null,
  holon: null,
  connectionState: 'connecting' as ConnectionState,
  error: null,
  symptoms: [],
  medications: [],
  isLoading: true,
  addMedication: async () => {},
  removeMedication: async () => {},
  takeMedication: async () => {},
  addSymptom: () => {},
}

const AppContext = createContext<AppState>(defaultState)
const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    ...defaultState,
    isLoading: true,
    addMedication: noop,
    removeMedication: noop,
    takeMedication: noop,
    addSymptom: noop,
  })

  const lastActivity = useRef<number>(Date.now())
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now()
  }, [])

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const addMedication = useCallback(async (med: Medication) => {
    setState(prev => {
      const updated = [...prev.medications, med]
      saveMedications(updated)
      return { ...prev, medications: updated }
    })
    const { twin } = state
    if (twin) {
      twin.flag('medication', {
        code: 'medication.added',
        value: JSON.stringify({ name: med.name, conceptId: med.conceptId }),
        title: `Added: ${med.name}`,
      }).catch(() => {})
    }
  }, [state.twin])

  const removeMedication = useCallback(async (id: string) => {
    setState(prev => {
      const med = prev.medications.find(m => m.id === id)
      const updated = prev.medications.filter(m => m.id !== id)
      saveMedications(updated)
      if (med && prev.twin) {
        prev.twin.flag('medication', {
          code: 'medication.removed',
          value: JSON.stringify({ id, name: med.name }),
          title: `Removed: ${med.name}`,
        }).catch(() => {})
      }
      return { ...prev, medications: updated }
    })
  }, [])

  const takeMedication = useCallback(async (id: string) => {
    setState(prev => {
      const updated = prev.medications.map(m =>
        m.id === id ? { ...m, lastTaken: new Date().toISOString() } : m
      )
      saveMedications(updated)
      return { ...prev, medications: updated }
    })
  }, [])

  const addSymptom = useCallback((symptom: Symptom) => {
    setState(prev => {
      const updated = [...prev.symptoms, symptom]
      AsyncStorage.setItem('medication-safety:symptoms', JSON.stringify(updated)).catch(() => {})
      if (prev.twin) {
        prev.twin.flag('symptoms', {
          code: 'symptom.logged',
          value: JSON.stringify(symptom),
          title: symptom.description,
        }).catch(() => {})
      }
      return { ...prev, symptoms: updated }
    })
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const stored = await loadMedications()
        const storedSymptoms = await AsyncStorage.getItem('medication-safety:symptoms')
        const symptoms: Symptom[] = storedSymptoms ? JSON.parse(storedSymptoms) : []

        const { twin, holon } = connectSandboxTwin()
        if (!mounted) return
        setState(prev => ({
          ...prev,
          twin,
          holon,
          medications: stored,
          symptoms,
          connectionState: 'connected',
          isLoading: false,
          error: null,
        }))
      } catch (err: any) {
        if (!mounted) return
        setState(prev => ({
          ...prev,
          isLoading: false,
          connectionState: 'error',
          error: err.message ?? 'Connection failed',
        }))
      }
    }

    init()

    idleTimer.current = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_TIMEOUT_MS) {
        setState(prev => ({ ...prev, connectionState: 'error', error: 'Session expired. Get a fresh grant token.' }))
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

  const ctx = {
    ...state,
    addMedication,
    removeMedication,
    takeMedication,
    addSymptom,
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

function noop() {}
