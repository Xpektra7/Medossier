export interface Medication {
  id: string
  conceptId: number
  rxnormCode: string
  name: string
  addedAt: string
  lastTaken?: string
}

export interface Symptom {
  id: string
  description: string
  severity: 'mild' | 'moderate' | 'severe'
  loggedAt: string
  relatedDrugs?: string[]
}

export type ConnectionState = 'connecting' | 'connected' | 'error'

export interface Interaction {
  drugA: string
  drugB: string
  severity: string
  clinicalEffect?: string
  management?: string
  evidenceGrade?: string
}

export interface AppState {
  twin: any | null
  holon: any | null
  connectionState: ConnectionState
  error: string | null
  medications: Medication[]
  symptoms: Symptom[]
  isLoading: boolean
  addMedication: (med: Medication) => Promise<void>
  removeMedication: (id: string) => Promise<void>
  takeMedication: (id: string) => Promise<void>
}