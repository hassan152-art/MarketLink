import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../Navbar.jsx'
import Footer from '../Footer.jsx'
import PageHero from '../PageHero.jsx'
import SearchBar from './SearchBar.jsx'
import LocationSelector from './LocationSelector.jsx'
import FilterButton from './FilterButton.jsx'
import FilterDrawer from './FilterDrawer.jsx'
import MarketCard from './MarketCard.jsx'
import FarmerCard from './FarmerCard.jsx'
import ProductCard from './ProductCard.jsx'
import { useData } from '../../context/DataContext.jsx'
import { LoadingBlock, ErrorBlock } from '../PageState.jsx'
import { EMPTY_FILTERS, FILTER_GROUPS, SORTS, matchesFilters, matchesQuery } from '../../utils/discovery.js'

const CONFIG = {
  Markets: {
    key: 'markets',
    noun: 'market',
    grid: 'sm:grid-cols-2 lg:grid-cols-3',
    Card: ({ item }) => <MarketCard market={item} />
  },
  Farmers: {
    key: 'farmers',
    noun: 'farmer',
    grid: 'sm:grid-cols-2 lg:grid-cols-3',
    Card: ({ item }) => <FarmerCard farmer={item} />
  },
  Products: {
    key: 'products',
    noun: 'product',
    grid: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    Card: ({ item }) => <ProductCard product={item} />
  }
}

/**
 * One full listing page (search + sort + filters + grid) for any of the
 * three discovery types. Pages just pass `kind`, `title`, `description`.
 */
export default function ListingLayout({ kind, title, description }) {
  const { key, noun, grid, Card } = CONFIG[kind]
  const { status, reload, ...lists } = useData()
  const data = lists[key]
  const sorts = SORTS[kind]

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState(sorts[0].key)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const results = useMemo(() => {
    const sorter = sorts.find((s) => s.key === sortKey)?.fn
    const list = data.filter((item) => matchesQuery(item, kind, query) && matchesFilters(item, kind, filters))
    return sorter ? [...list].sort(sorter) : list
  }, [data, kind, query, filters, sortKey, sorts])

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)

  const toggleFilter = (group, value) =>
    setFilters((prev) => {
      const has = prev[group].includes(value)
      return { ...prev, [group]: has ? prev[group].filter((v) => v !== value) : [...prev[group], value] }
    })

  const clearAll = () => {
    setFilters(EMPTY_FILTERS)
    setQuery('')
  }

  return (
    <>
      <Navbar />
      <PageHero crumbs={[{ label: 'Home', to: '/' }, { label: kind }]} title={title} description={description} />

      <main className="relative bg-cream py-12 md:py-16">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 15% 0%, #EFE8D6 0%, transparent 55%), radial-gradient(ellipse at 100% 30%, #EFE8D6 0%, transparent 45%)' }}
        />

        <div className="container-page relative">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <SearchBar value={query} onChange={setQuery} placeholder={`Search ${kind.toLowerCase()}...`} />
            <div className="flex flex-wrap items-center gap-3 md:ml-auto">
              <LocationSelector />
              <label className="flex items-center border border-forest/15 bg-white/60 pl-4 text-sm text-forest-deep/60 focus-within:border-olive">
                <span className="mr-2">Sort</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="bg-transparent py-3 pr-4 text-sm text-forest-deep focus:outline-none cursor-pointer"
                >
                  {sorts.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <FilterButton onClick={() => setDrawerOpen(true)} activeCount={activeFilterCount} />
            </div>
          </div>

          {status === 'ready' && (
            <p className="text-sm text-forest-deep/55 mb-8" aria-live="polite">
              {results.length} {noun}
              {results.length === 1 ? '' : 's'} found
            </p>
          )}

          {status === 'loading' ? (
            <LoadingBlock />
          ) : status === 'error' ? (
            <ErrorBlock onRetry={reload} />
          ) : results.length === 0 ? (
            <div className="py-20 text-center text-forest-deep/60">
              <p className="font-display text-2xl text-forest-deep mb-2">No {kind.toLowerCase()} match that</p>
              <p className="text-sm mb-6">Try a different search term or loosen your filters.</p>
              <button onClick={clearAll} className="text-sm border-b border-olive text-forest-deep hover:text-olive transition-colors pb-1">
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${grid} gap-6 md:gap-8`}>
              {results.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06, ease: 'easeOut' }}
                >
                  <Card item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          onToggle={toggleFilter}
          onClear={() => setFilters(EMPTY_FILTERS)}
          groups={FILTER_GROUPS[kind]}
        />
      </main>
      <Footer />
    </>
  )
}
