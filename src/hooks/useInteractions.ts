import { useState, useRef } from 'react'
import { useApp } from '@/hooks/useApp'
import type { Medication, InteractionEntry } from '@/types'

export function useInteractions(medications: Medication[]) {
  const { holon } = useApp()
  const [interactions, setInteractions] = useState<InteractionEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<Map<string, InteractionEntry[]>>(new Map())

  async function checkInteractions() {
    if (!holon || medications.length < 2) {
      setInteractions([])
      return
    }

    const sorted = [...medications].map(m => m.name).sort().join('|')
    const cached = cache.current.get(sorted)
    if (cached) {
      setInteractions(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const conceptIds: number[] = []
      for (const med of medications) {
        if (med.conceptId) {
          conceptIds.push(med.conceptId)
        } else {
          const res = await holon.concepts.search(med.name, { domain: 'Drug' })
          const hit = res.hits?.[0]
          if (hit?.conceptId) {
            conceptIds.push(hit.conceptId)
          }
        }
      }

      if (conceptIds.length < 2) {
        setInteractions([])
        setLoading(false)
        return
      }

      const result = await holon.interactions.checkList(conceptIds)
      const flattened = result.pairs?.flatMap((p: any) =>
        (p.interactions || []).map((i: any) => ({
          severity: i.severity || 'unknown',
          description: i.clinicalEffect || i.description || '',
          management: i.management || undefined,
          bodySystems: [],
          drugA: p.drugA,
          drugB: p.drugB,
        }))
      ) ?? []

      cache.current.set(sorted, flattened)
      setInteractions(flattened)
    } catch (err: any) {
      setError(err.message ?? 'Interaction check failed')
    } finally {
      setLoading(false)
    }
  }

  return { interactions, loading, error, checkInteractions }
}
