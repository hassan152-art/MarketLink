import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from '../components/discovery/ProductCard.jsx'
import { useData } from '../context/DataContext.jsx'

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']

export default function ProductStoryGrid() {
  const { products, status } = useData()
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])

  const filtered = useMemo(() => products.filter((p) => p.category === activeCategory), [products, activeCategory])
  const feature = filtered[0]
  const rest = filtered.slice(1)

  if (status !== 'ready') return null

  return (
    <section className="bg-cream-soft py-24 md:py-32">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-xl mb-12"
        >
          <span className="block text-olive text-xs tracking-widest2 uppercase font-body mb-3">By Category</span>
          <h2 className="font-display text-3xl md:text-4xl text-forest-deep">Fresh From Local Farms</h2>
        </motion.div>

        {/* Category navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-12 border-b border-forest/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`shrink-0 px-5 py-3 text-sm tracking-wide transition-colors border-b-2 -mb-px ${
                activeCategory === cat
                  ? 'text-forest-deep border-olive'
                  : 'text-forest-deep/50 border-transparent hover:text-forest-deep/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {!feature ? (
              <p className="text-forest-deep/50 py-16 text-center">No products in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
                {/* Large editorial feature card */}
                <Link
                  to={`/products/${feature.id}`}
                  className="group relative flex flex-col overflow-hidden bg-forest-deep min-h-[420px] justify-end"
                >
                  <img
                    src={feature.images?.[0]}
                    alt={feature.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/50 to-transparent" />

                  <div className="relative p-8 md:p-10 text-cream">
                    <span className="block text-olive-light text-xs tracking-widest2 uppercase font-body mb-4">
                      {feature.category}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl leading-snug mb-3">
                      Fresh From {feature.farmer.name}
                    </h3>
                    <p className="text-cream/70 text-sm mb-6">Starting from</p>
                    <p className="font-display text-2xl mb-6">
                      Rs. {feature.price} <span className="text-base font-body text-cream/60">/ {feature.unit}</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-cream/80 mb-6">
                      <span className={`h-1.5 w-1.5 rounded-full ${feature.available ? 'bg-sage' : 'bg-cream/30'}`} />
                      {feature.available ? 'Available' : 'Sold Out'}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm border-b border-olive-light/70 pb-1 group-hover:gap-3 transition-all duration-300">
                      View Product
                      <span>→</span>
                    </span>
                  </div>
                </Link>

                {/* Rest of the category's products in a compact grid */}
                <div className="grid grid-cols-2 gap-5">
                  {rest.length === 0 ? (
                    <p className="col-span-2 text-forest-deep/50 self-center text-center py-10">
                      No other products in {activeCategory} yet.
                    </p>
                  ) : (
                    rest.map((product) => <ProductCard key={product.id} product={product} />)
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
