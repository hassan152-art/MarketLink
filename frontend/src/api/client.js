// Tiny fetch wrapper for the MarketLink backend.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`)
  } catch {
    throw new ApiError('Cannot reach the server', 0)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status)
  }
  return res.json()
}

export const api = { get: request }
