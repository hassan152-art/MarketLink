import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

const DataContext = createContext(null)

/**
 * Loads the three main lists once from the backend and shares them with the
 * home sections, listing pages and detail-page "related" rows.
 * status: 'loading' | 'ready' | 'error'
 */
export function DataProvider({ children }) {
  const [state, setState] = useState({ markets: [], farmers: [], products: [], status: 'loading' })

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }))
    Promise.all([api.get('/markets'), api.get('/farmers'), api.get('/products')])
      .then(([markets, farmers, products]) => setState({ markets, farmers, products, status: 'ready' }))
      .catch(() => setState((s) => ({ ...s, status: 'error' })))
  }, [])

  useEffect(load, [load])

  return <DataContext.Provider value={{ ...state, reload: load }}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
