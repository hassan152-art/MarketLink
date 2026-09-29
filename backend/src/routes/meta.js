import { Router } from 'express'
import { markets } from '../data/markets.js'
import { farmers } from '../data/farmers.js'
import { products } from '../data/products.js'

const router = Router()

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Used by the About page.
router.get('/stats', (_req, res) =>
  res.json({ markets: markets.length, farmers: farmers.length, products: products.length })
)

export default router
