export interface Medication {
  id: string
  conceptId: number
  rxnormCode: string
  name: string
  addedAt: string
  lastTaken?: string
}

export type ConnectionState = 'connecting' | 'connected' | 'error'

export interface AppState {
  twin: any | null
  holon: any | null
  connectionState: ConnectionState
  error: string | null
}

export type RootTabParamList = {
  Home: undefined
  Medications: undefined
  Timeline: undefined
}