import { useEffect, useState } from 'react'

/** useState that remembers its value in localStorage. Falls back silently if storage is blocked. */
export function usePersistentState(key, initial, override) {
  const [value, setValue] = useState(() => {
    if (override !== undefined && override !== null) return override
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* private mode or blocked storage: keep working without persistence */
    }
  }, [key, value])

  return [value, setValue]
}
