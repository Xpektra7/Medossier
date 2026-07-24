import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/hooks/useApp'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Symptom } from '@/types'

const STORAGE_KEY = 'medication-safety:symptoms'

export function useSymptomLog() {
  const { twin } = useApp()
  const [symptoms, setSymptoms] = useState<Symptom[]>([])

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setSymptoms(JSON.parse(stored))
        } catch {
          // ignore corrupt data
        }
      }
    })
  }, [])

  const persist = useCallback((updated: Symptom[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {})
  }, [])

  function logSymptom(description: string, severity: 'mild' | 'moderate' | 'severe') {
    const symptom: Symptom = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      description,
      severity,
      loggedAt: new Date().toISOString(),
    }

    setSymptoms((prev) => {
      const updated = [...prev, symptom]
      persist(updated)
      return updated
    })

    if (twin) {
      twin.flag('symptoms', {
        code: 'symptom.logged',
        value: JSON.stringify(symptom),
        title: description,
      }).catch(() => {})
    }
  }

  function clearSymptoms() {
    setSymptoms([])
    persist([])
  }

  return { symptoms, logSymptom, clearSymptoms }
}