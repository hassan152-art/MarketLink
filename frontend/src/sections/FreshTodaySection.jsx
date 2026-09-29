import { motion } from 'framer-motion'
import ProductShowcase from '../components/discovery/ProductShowcase.jsx'
import { useData } from '../context/DataContext.jsx'

export default function FreshTodaySection() {
  const { products } = useData()
  const featured = products.slice(0, 6)
  if (featured.length === 0) return null

  return (
    <section className="bg-cream-soft py-20 md:py-28">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="block text-olive text-xs tracking-widest2 uppercase font-body mb-3">This Week</span>
            <h2 className="font-display text-3xl md:text-4xl text-forest-deep">Fresh Today</h2>
          </div>
          <p className="hidden sm:block text-forest-deep/50 text-sm">Scroll to browse →</p>
        </motion.div>
      </div>

      <div className="container-page">
        <ProductShowcase items={featured} />
      </div>
    </section>
  )
}
