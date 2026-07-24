import { useState, useRef } from 'react'
import { analyzeHealthPattern } from '@/api/groq'
import type { Symptom, Medication } from '@/types'

const RATE_LIMIT_MS = 30_000

export function usePatternAnalysis() {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastCall = useRef<number>(0)

  async function analyze(symptoms: Symptom[], medications: Medication[]) {
    const now = Date.now()
    if (now - lastCall.current < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastCall.current)) / 1000)
      setError(`Please wait ${remaining}s before requesting another analysis.`)
      return
    }

    lastCall.current = now
    setLoading(true)
    setError(null)

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentSymptoms = symptoms.filter((s) => new Date(s.loggedAt) >= thirtyDaysAgo)
      const result = await analyzeHealthPattern(recentSymptoms, medications)
      setInsight(result)
    } catch (err: any) {
      setError(err.message ?? 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return { insight, loading, error, analyze }
}