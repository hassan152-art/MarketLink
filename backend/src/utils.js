// Small helpers shared by the route files.

export const includes = (value, q) => String(value).toLowerCase().includes(q)

// Parse "?minRating=4.5" style numbers; returns undefined when absent/invalid.
export const num = (v) => {
  if (v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

// Apply a sort key from a { key: comparator } map; unknown keys are ignored.
export const sortBy = (list, key, comparators) => {
  const fn = comparators[key]
  return fn ? [...list].sort(fn) : list
}
