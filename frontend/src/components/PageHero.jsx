import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * Dark forest header band for inner pages. Sits under the fixed navbar,
 * mirrors the CTA section's quiet blurred-shape treatment, and carries a
 * breadcrumb so people always know where they are.
 * `crumbs`: [{ label, to? }] — last item is the current page.
 */
export default function PageHero({ crumbs = [], title, description, children }) {
  return (
    <section className="relative bg-forest-deep pt-36 pb-16 md:pt-44 md:pb-20 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sage/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-olive/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="container-page relative">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-cream/55">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {c.to ? (
                  <Link to={c.to} className="hover:text-olive-light transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-cream/85" aria-current="page">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] max-w-3xl"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="mt-5 text-cream/70 text-base md:text-lg leading-relaxed max-w-xl"
          >
            {description}
          </motion.p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
