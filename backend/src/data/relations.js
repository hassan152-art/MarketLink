// Connects markets, farmers and products so the API can return
// "who sells here" / "what this farmer grows" in one response.
import { markets } from './markets.js'
import { farmers } from './farmers.js'
import { products } from './products.js'

// farmers.market is a short name ("Green Valley Market") while markets.name
// is the full one ("Green Valley Farmers Market"): match on the shared stem.
const stem = (name) => name.toLowerCase().replace(/\s+market$/, '')

export const findMarket = (id) => markets.find((m) => String(m.id) === String(id))
export const findFarmer = (id) => farmers.find((f) => String(f.id) === String(id))
export const findProduct = (id) => products.find((p) => String(p.id) === String(id))

export const marketForFarmer = (farmer) => markets.find((m) => m.name.toLowerCase().includes(stem(farmer.market))) ?? null
export const farmersForMarket = (market) => farmers.filter((f) => market.name.toLowerCase().includes(stem(f.market)))
export const productsForMarket = (market) => products.filter((p) => p.market.id === market.id)
export const productsForFarmer = (farmer) => products.filter((p) => p.farmer.id === farmer.id)
