import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Main image + thumbnail rail for the product detail page.
 * Keyboard accessible: left/right arrow keys move between images
 * whenever the gallery (or a control inside it) has focus context
 * on the page.
 */
export default function ProductGallery({ images = [], alt = '' }) {
  const [index, setIndex] = useState(0)
  const safeImages = images.length ? images : ['/images/products/placeholder.svg']

  const goTo = useCallback((i) => setIndex((i + safeImages.length) % safeImages.length), [safeImages.length])
  const next = useCallback(() => goTo(index + 1), [index, goTo])
  const prev = useCallback(() => goTo(index - 1), [index, goTo])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-cream-soft border border-forest/10 rounded-lg">
        <AnimatePresence mode="wait">
          <motion.img
            key={safeImages[index]}
            src={safeImages[index]}
            alt={`${alt} — image ${index + 1} of ${safeImages.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </AnimatePresence>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-cream/85 hover:bg-cream transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-olive"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-cream/85 hover:bg-cream transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-olive"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {safeImages.map((img, i) => (
            <button
              type="button"
              key={img + i}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`shrink-0 h-16 w-16 overflow-hidden border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-olive ${
                i === index ? 'border-olive' : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
