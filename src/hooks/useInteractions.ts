import { useState, useRef } from 'react'
import { useApp } from '@/hooks/useApp'
import type { Medication, Interaction } from '@/types'

const cache = new Map<string, Interaction[]>()

function cacheKey(meds: Medication[]): string {
  return meds
    .map((m) => m.conceptId)
    .filter(Boolean)
    .sort((a, b) => a - b)
    .join('-')
}

export function useInteractions(medications: Medication[]) {
  const { holon } = useApp()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const key = useRef('')

  async function check() {
    const meds = medications.filter((m) => m.conceptId)
    if (meds.length < 2) {
      setInteractions([])
      return
    }

    const ck = cacheKey(meds)
    const cached = cache.get(ck)
    if (cached) {
      setInteractions(cached)
      return
    }

    if (!holon) {
      setError('HOLON client not connected')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const ids = meds.map((m) => m.conceptId)
      const res = await holon.interactions.checkList(ids)
      const flat: Interaction[] = (res.pairs ?? []).flatMap((p: any) =>
        (p.interactions ?? []).map((i: any) => ({
          drugA: p.drugA ?? '',
          drugB: p.drugB ?? '',
          severity: i.severity ?? 'unknown',
          clinicalEffect: i.clinicalEffect,
          management: i.management,
          evidenceGrade: i.evidenceGrade,
        }))
      )
      cache.set(ck, flat)
      if (key.current === ck) setInteractions(flat)
    } catch (err: any) {
      setError(err.message ?? 'Interaction check failed')
    } finally {
      setLoading(false)
    }
  }

  key.current = cacheKey(medications)

  return { interactions, loading, error, check }
}