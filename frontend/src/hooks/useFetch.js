import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

/**
 * Fetch one resource (e.g. '/markets/3') for a detail page.
 * status: 'loading' | 'ready' | 'notfound' | 'error'
 */
export function useFetch(path) {
  const [state, setState] = useState({ data: null, status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, status: 'loading' })
    api
      .get(path)
      .then((data) => !cancelled && setState({ data, status: 'ready' }))
      .catch((err) => !cancelled && setState({ data: null, status: err.status === 404 ? 'notfound' : 'error' }))
    return () => {
      cancelled = true
    }
  }, [path, tick])

  const retry = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, retry }
}
