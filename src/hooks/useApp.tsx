import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { AppState as RNAppState, AppStateStatus } from 'react-native'
import { connectSandboxTwin } from '@/api/dtp'
import type { AppState, ConnectionState } from '@/types'

const AppContext = createContext<AppState>({
  twin: null,
  holon: null,
  connectionState: 'connecting',
  error: null,
})

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    twin: null,
    holon: null,
    connectionState: 'connecting',
    error: null,
  })

  const lastActivity = useRef<number>(Date.now())
  const idleTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now()
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { twin, holon } = connectSandboxTwin()
        if (!mounted) return
        setState({ twin, holon, connectionState: 'connected', error: null })
      } catch (err: any) {
        if (!mounted) return
        setState({
          twin: null,
          holon: null,
          connectionState: 'error',
          error: err.message ?? 'Failed to connect to sandbox twin',
        })
      }
    }

    init()

    idleTimer.current = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_TIMEOUT_MS) {
        setState((prev) => ({
          ...prev,
          connectionState: 'error',
          error: 'Session expired. Get a fresh grant token from the Sandbox page.',
        }))
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

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}