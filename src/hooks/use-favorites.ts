'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'autoroyal:favorites'

/** Favoris conserves dans le navigateur (aucun compte requis). */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      setIds(raw ? (JSON.parse(raw) as string[]) : [])
    } catch {
      setIds([])
    }
    setReady(true)
  }, [])

  const persist = useCallback((next: string[]) => {
    setIds(next)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // stockage indisponible : les favoris restent valables pour la session
    }
  }, [])

  const toggle = useCallback(
    (id: string) => {
      persist(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id])
    },
    [ids, persist],
  )

  return { ids, ready, toggle, isFavorite: (id: string) => ids.includes(id) }
}
