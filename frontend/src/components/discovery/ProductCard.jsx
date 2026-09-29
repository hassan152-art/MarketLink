import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProductCard({ product }) {
  const [favorited, setFavorited] = useState(false)
  const thumbnail = product.images?.[0] ?? product.image

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden border border-forest/10 bg-cream-soft hover:border-olive/50 transition-colors"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={thumbnail}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        <button
          type="button"
          onClick={() => setFavorited((v) => !v)}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorited}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center bg-cream/90 text-forest-deep hover:scale-105 transition-transform"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={favorited ? '#A98B4F' : 'none'}
            stroke={favorited ? '#A98B4F' : 'currentColor'}
            strokeWidth="1.8"
          >
            <path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.3 5 5.9 5c2 0 3.4 1 6.1 3.6C14.7 6 16.1 5 18.1 5c3.6 0 5.4 3.4 3.9 6.9C19.5 16.4 12 21 12 21Z" />
          </svg>
        </button>

        {!product.available && (
          <span className="absolute bottom-3 left-3 bg-forest-deep/80 text-cream text-[11px] px-2.5 py-1">Sold Out</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-5">
        <span className="text-[11px] uppercase tracking-wide text-olive">{product.category}</span>
        <h3 className="font-display text-lg text-forest-deep leading-snug">{product.name}</h3>
        <p className="text-xs text-forest-deep/55">{product.farmer?.name ?? product.farmer}</p>

        <div className="flex items-center gap-1 text-xs text-forest-deep/70 mt-0.5">
          <span className="text-olive">★</span>
          {product.rating}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-forest-deep font-medium">
            Rs. {product.price} <span className="text-forest-deep/50 font-normal text-sm">/ {product.unit}</span>
          </p>
          <span className={`flex items-center gap-1.5 text-xs ${product.available ? 'text-sage' : 'text-forest-deep/40'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${product.available ? 'bg-sage' : 'bg-forest-deep/30'}`} />
            {product.available ? 'Available' : 'Sold Out'}
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-2 inline-flex items-center gap-2 text-sm text-forest-deep group-hover:text-olive transition-colors w-fit"
        >
          View Product
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </motion.article>
  )
}
