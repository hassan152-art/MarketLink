import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function MarketCard({ market }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden border border-forest/10 bg-cream-soft hover:border-olive/50 transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={market.image}
          alt={market.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/10 to-transparent" />
        <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-cream/90 px-3 py-1.5 text-xs text-forest-deep">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z" />
            <circle cx="12" cy="9" r="2.4" />
          </svg>
          {market.location}
        </span>
        <span className="absolute bottom-4 right-4 text-cream text-xs bg-forest-deep/70 px-2.5 py-1">
          {market.distanceKm} km
        </span>
      </div>

      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-display text-xl text-forest-deep leading-snug">{market.name}</h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-deep/60">
          <span>{market.days}</span>
          <span>{market.time}</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-forest-deep/75 pt-1">
          <span>{market.farmers} Farmers</span>
          <span>{market.products} Products</span>
        </div>

        <Link
          to={`/markets/${market.id}`}
          className="mt-2 inline-flex items-center gap-2 text-sm text-forest-deep group-hover:text-olive transition-colors w-fit"
        >
          Explore Market
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.article>
  )
}
