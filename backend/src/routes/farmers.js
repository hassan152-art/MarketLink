import { Router } from 'express'
import { farmers } from '../data/farmers.js'
import { findFarmer, marketForFarmer, productsForFarmer } from '../data/relations.js'
import { includes, num, sortBy } from '../utils.js'

const router = Router()

const SORTS = {
  rating: (a, b) => b.rating - a.rating,
  products: (a, b) => b.products - a.products,
  name: (a, b) => a.name.localeCompare(b.name)
}

// GET /api/farmers?q=&minRating=&sort=rating|products|name
router.get('/', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase()
  const minRating = num(req.query.minRating)

  let list = farmers.filter(
    (f) =>
      (!q || includes(f.name, q) || includes(f.farm, q) || includes(f.specialty, q)) &&
      (minRating === undefined || f.rating >= minRating)
  )
  list = sortBy(list, req.query.sort, SORTS)
  res.json(list)
})

// GET /api/farmers/:id  -> farmer + their market + their products
router.get('/:id', (req, res) => {
  const farmer = findFarmer(req.params.id)
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
  res.json({ ...farmer, marketInfo: marketForFarmer(farmer), productList: productsForFarmer(farmer) })
})

export default router
