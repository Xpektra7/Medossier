export interface Medication {
  id: string
  conceptId?: number
  rxnormCode?: string
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

export interface AppState {
  twin: any | null
  holon: any | null
  connectionState: ConnectionState
  error: string | null
  symptoms: Symptom[]
  medications: Medication[]
  isLoading: boolean
  addMedication: (med: Medication) => Promise<void>
  removeMedication: (id: string) => Promise<void>
  takeMedication: (id: string) => Promise<void>
  addSymptom: (symptom: Symptom) => void
}

export interface SearchResult {
  conceptId?: number
  conceptCode?: string
  conceptName: string
  vocabularyId?: string
  domainId?: string
}

export interface InteractionEntry {
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor' | 'unknown'
  description: string
  management?: string
  bodySystems: string[]
  drugA?: string
  drugB?: string
}

export interface DrugInfo {
  whatItDoes: string
  warnings?: string
  bodySystems: string[]
  genericName: string
}
