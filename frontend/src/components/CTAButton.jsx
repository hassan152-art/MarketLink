import { motion } from 'framer-motion'

/**
 * Reusable call-to-action button.
 * variant: 'solid' (olive fill) | 'outline' (cream outline, for use on dark/video backgrounds)
 */
export default function CTAButton({ children, onClick, variant = 'solid', className = '', type = 'button' }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm tracking-wide font-body font-medium transition-colors duration-300'

  const styles =
    variant === 'outline'
      ? 'border border-cream/70 text-cream hover:bg-cream hover:text-forest-deep'
      : 'bg-olive text-forest-deep hover:bg-olive-light'

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.2 }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.button>
  )
}
