import { Router } from 'express'
import { markets } from '../data/markets.js'
import { findMarket, farmersForMarket, productsForMarket } from '../data/relations.js'
import { includes, num, sortBy } from '../utils.js'

const router = Router()

const SORTS = {
  nearest: (a, b) => a.distanceKm - b.distanceKm,
  rating: (a, b) => b.rating - a.rating,
  farmers: (a, b) => b.farmers - a.farmers
}

// GET /api/markets?q=&maxDistance=&sort=nearest|rating|farmers
router.get('/', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase()
  const maxDistance = num(req.query.maxDistance)

  let list = markets.filter(
    (m) => (!q || includes(m.name, q) || includes(m.location, q)) && (maxDistance === undefined || m.distanceKm <= maxDistance)
  )
  list = sortBy(list, req.query.sort, SORTS)
  res.json(list)
})

// GET /api/markets/:id  -> market + its farmers + its products
router.get('/:id', (req, res) => {
  const market = findMarket(req.params.id)
  if (!market) return res.status(404).json({ error: 'Market not found' })
  res.json({ ...market, farmerList: farmersForMarket(market), productList: productsForMarket(market) })
})

export default router
