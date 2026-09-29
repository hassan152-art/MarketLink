import { Router } from 'express'
import { products } from '../data/products.js'
import { findProduct } from '../data/relations.js'
import { includes, num, sortBy } from '../utils.js'

const router = Router()

const SORTS = {
  rating: (a, b) => b.rating - a.rating,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  nearest: (a, b) => a.distance - b.distance
}

// GET /api/products?q=&category=&available=true|false&minPrice=&maxPrice=&minRating=&maxDistance=&sort=
router.get('/', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase()
  const category = String(req.query.category ?? '').toLowerCase()
  const { available } = req.query
  const minPrice = num(req.query.minPrice)
  const maxPrice = num(req.query.maxPrice)
  const minRating = num(req.query.minRating)
  const maxDistance = num(req.query.maxDistance)

  let list = products.filter(
    (p) =>
      (!q || includes(p.name, q) || includes(p.category, q) || includes(p.farmer.name, q)) &&
      (!category || p.category.toLowerCase() === category) &&
      (available === undefined || p.available === (available === 'true')) &&
      (minPrice === undefined || p.price >= minPrice) &&
      (maxPrice === undefined || p.price <= maxPrice) &&
      (minRating === undefined || p.rating >= minRating) &&
      (maxDistance === undefined || p.distance <= maxDistance)
  )
  list = sortBy(list, req.query.sort, SORTS)
  res.json(list)
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = findProduct(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json(product)
})

export default router
