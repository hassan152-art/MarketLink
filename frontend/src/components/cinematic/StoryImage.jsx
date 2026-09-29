import { AnimatePresence, motion } from 'framer-motion'

/**
 * Layered, crossfading scene image for the cinematic product story.
 * Keyed by src so Framer Motion mounts a new layer and animates the
 * outgoing one out while the incoming one animates in — only one
 * image is ever visually dominant. Optionally shows a small
 * display-only floating product panel (no cart action).
 */
export default function StoryImage({ image, alt, floatingProduct }) {
  return (
    <div className="relative aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-2xl border border-cream/15 bg-forest-deep">
      <AnimatePresence mode="sync">
        <motion.img
          key={image}
          src={image}
          alt={alt}
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.04, y: -24 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/35 via-transparent to-transparent pointer-events-none" />

      {floatingProduct && (
        <motion.div
          key={floatingProduct.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-56 bg-cream/95 backdrop-blur-sm p-4 shadow-lg"
        >
          <p className="text-[10px] tracking-widest2 uppercase text-olive mb-1">Fresh Today</p>
          <p className="font-display text-lg text-forest-deep leading-snug">{floatingProduct.name}</p>
          <p className="text-forest-deep/70 text-sm mt-0.5">
            Rs. {floatingProduct.price} / {floatingProduct.unit}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Available
          </div>
          <p className="text-[11px] text-forest-deep/50 mt-2">From: {floatingProduct.farmer.name}</p>
        </motion.div>
      )}
    </div>
  )
}
