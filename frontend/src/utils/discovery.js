// Shared search / filter / sort logic for the discovery UI.
// Used by the home-page ExploreSection AND the full listing pages
// (/markets, /farmers, /products) so behaviour stays identical.

export const EMPTY_FILTERS = { category: [], price: [], availability: [], rating: [], distance: [] }

export function matchesQuery(item, tab, query) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  if (tab === 'Markets') return item.name.toLowerCase().includes(q) || item.location.toLowerCase().includes(q)
  if (tab === 'Farmers')
    return (
      item.name.toLowerCase().includes(q) ||
      item.farm.toLowerCase().includes(q) ||
      item.specialty.toLowerCase().includes(q)
    )
  return (
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.farmer.name.toLowerCase().includes(q)
  )
}

export function matchesFilters(item, tab, filters) {
  if (tab === 'Products') {
    if (filters.category.length && !filters.category.includes(item.category)) return false
    if (filters.availability.length) {
      const wantsAvailable = filters.availability.includes('available')
      const wantsSoldOut = filters.availability.includes('sold-out')
      if (wantsAvailable && !wantsSoldOut && !item.available) return false
      if (wantsSoldOut && !wantsAvailable && item.available) return false
    }
    if (filters.price.length) {
      const inRange = filters.price.some((p) => {
        if (p === 'under-200') return item.price < 200
        if (p === '200-500') return item.price >= 200 && item.price <= 500
        if (p === 'over-500') return item.price > 500
        return true
      })
      if (!inRange) return false
    }
  }

  if (tab === 'Products' || tab === 'Farmers') {
    if (filters.rating.length) {
      const meetsRating = filters.rating.some((min) => item.rating >= min)
      if (!meetsRating) return false
    }
  }

  if (tab === 'Products' || tab === 'Markets') {
    if (filters.distance.length) {
      const distance = tab === 'Products' ? item.distance : item.distanceKm
      const withinRange = filters.distance.some((max) => distance <= max)
      if (!withinRange) return false
    }
  }

  return true
}

// Which filter groups make sense for each listing.
export const FILTER_GROUPS = {
  Markets: ['distance'],
  Farmers: ['rating'],
  Products: ['category', 'price', 'availability', 'rating', 'distance']
}

// Sort options per listing. `key` is what the <select> stores.
export const SORTS = {
  Markets: [
    { key: 'nearest', label: 'Nearest first', fn: (a, b) => a.distanceKm - b.distanceKm },
    { key: 'rating', label: 'Top rated', fn: (a, b) => b.rating - a.rating },
    { key: 'farmers', label: 'Most farmers', fn: (a, b) => b.farmers - a.farmers }
  ],
  Farmers: [
    { key: 'rating', label: 'Top rated', fn: (a, b) => b.rating - a.rating },
    { key: 'products', label: 'Most products', fn: (a, b) => b.products - a.products },
    { key: 'name', label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) }
  ],
  Products: [
    { key: 'rating', label: 'Top rated', fn: (a, b) => b.rating - a.rating },
    { key: 'price-asc', label: 'Price: low to high', fn: (a, b) => a.price - b.price },
    { key: 'price-desc', label: 'Price: high to low', fn: (a, b) => b.price - a.price },
    { key: 'nearest', label: 'Nearest first', fn: (a, b) => a.distance - b.distance }
  ]
}
