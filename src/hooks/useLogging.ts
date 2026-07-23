import { useEffect, useRef } from 'react'
import type { Medication } from '@/types'

interface InteractionPair {
  drugA: number
  drugB: number
  severity: string
  bodySystems: string[]
}

export function useMedicationLogger(
  twin: any | null,
  medications: Medication[],
  interactions: InteractionPair[]
) {
  const prevMeds = useRef<Medication[]>([])

  useEffect(() => {
    if (!twin) return

    const prev = prevMeds.current
    const added = medications.filter((m) => !prev.find((p) => p.id === m.id))

    for (const med of added) {
      twin.flag('medication', {
        code: 'medication.added',
        value: JSON.stringify({ name: med.name, conceptId: med.conceptId }),
        title: `Medication Added: ${med.name}`,
      }).catch(() => {})
    }

    prevMeds.current = medications
  }, [twin, medications])

  const loggedInteractionIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!twin) return

    for (const pair of interactions) {
      const key = `${pair.drugA}-${pair.drugB}`
      if (loggedInteractionIds.current.has(key)) continue
      loggedInteractionIds.current.add(key)

      twin.flag('medication', {
        code: 'interaction.found',
        value: JSON.stringify(pair),
        title: 'Interaction Found',
      }).catch(() => {})
    }
  }, [twin, interactions])
}