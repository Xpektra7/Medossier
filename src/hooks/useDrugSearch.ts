import { useState, useRef, useCallback } from 'react'
import type { SearchResult } from '@/types'

const HOLON_BASE = process.env.EXPO_PUBLIC_HOLON_BASE ?? 'https://api.holonsixtynine.xyz'
const HOLON_KEY = process.env.EXPO_PUBLIC_HOLON_KEY ?? ''

export function useDrugSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((text: string) => {
    setQuery(text)
    if (timer.current) clearTimeout(timer.current)
    if (text.length < 2) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${HOLON_BASE}/medication/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-holon-key': HOLON_KEY },
          body: JSON.stringify({ query: text }),
        })
        const json = await res.json()
        setResults(json.results ?? json ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [])

  return { query, results, loading, search }
}
