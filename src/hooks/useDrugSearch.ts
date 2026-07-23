import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/hooks/useApp'
import { lookupSynonym } from '@/data/nigeria-synonyms'

export interface SearchHit {
  conceptId: number
  holonUri: string
  conceptCode: string
  conceptName: string
  vocabularyId: string
  domainId: string
}

interface DrugSearchState {
  query: string
  results: SearchHit[]
  loading: boolean
  error: string | null
  resolvedFromSynonym: boolean
}

export function useDrugSearch() {
  const { holon } = useApp()
  const [state, setState] = useState<DrugSearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    resolvedFromSynonym: false,
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    setState((prev) => ({ ...prev, query, loading: true, error: null }))

    debounceRef.current = setTimeout(async () => {
      const trimmed = query.trim()
      if (!trimmed) {
        if (!mountedRef.current) return
        setState({ query: '', results: [], loading: false, error: null, resolvedFromSynonym: false })
        return
      }

      if (!holon) {
        if (!mountedRef.current) return
        setState((prev) => ({ ...prev, results: [], loading: false, error: 'HOLON client not connected', resolvedFromSynonym: false }))
        return
      }

      try {
        const synonym = lookupSynonym(trimmed)

        if (synonym) {
          const response = await holon.concepts.getByCode(synonym.rxnorm, 'RxNorm')
          if (!mountedRef.current) return
          const hit: SearchHit = {
            conceptId: response.concept.conceptId,
            holonUri: response.concept.holonUri,
            conceptCode: response.concept.conceptCode,
            conceptName: response.concept.conceptName,
            vocabularyId: response.concept.vocabularyId,
            domainId: response.concept.domainId,
          }
          setState({ query: trimmed, results: [hit], loading: false, error: null, resolvedFromSynonym: true })
        } else {
          const response = await holon.concepts.search(trimmed, { domain: 'Drug' })
          if (!mountedRef.current) return
          const hits: SearchHit[] = (response.hits ?? []).map((h: any) => ({
            conceptId: h.conceptId,
            holonUri: h.holonUri,
            conceptCode: h.conceptCode,
            conceptName: h.conceptName,
            vocabularyId: h.vocabularyId,
            domainId: h.domainId,
          }))
          setState({ query: trimmed, results: hits, loading: false, error: null, resolvedFromSynonym: false })
        }
      } catch (err: any) {
        if (!mountedRef.current) return
        setState((prev) => ({ ...prev, results: [], loading: false, error: err.message ?? 'Search failed', resolvedFromSynonym: false }))
      }
    }, 400)
  }

  return { ...state, search }
}