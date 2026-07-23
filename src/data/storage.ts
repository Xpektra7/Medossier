import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Medication } from '@/types'

const STORAGE_KEY = 'medication-safety:medications'

export async function loadMedications(): Promise<Medication[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return []
}

export async function saveMedications(meds: Medication[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meds))
  } catch {
    // ignore
  }
}