import express from 'express'
import cors from 'cors'
import meta from './routes/meta.js'
import markets from './routes/markets.js'
import farmers from './routes/farmers.js'
import products from './routes/products.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }))
  app.use(express.json())

  app.use('/api', meta)
  app.use('/api/markets', markets)
  app.use('/api/farmers', farmers)
  app.use('/api/products', products)

  // Unknown API routes -> JSON 404 (not an HTML page)
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

  // Last-resort error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  })

  return app
}
