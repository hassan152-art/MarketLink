import { Link } from 'react-router-dom'

export default function SectionHeading({ title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 md:mb-10">
      <div>
        <h2 className="font-display text-3xl md:text-4xl text-forest-deep leading-[1.1]">{title}</h2>
        {subtitle && <p className="mt-2 text-forest-deep/60 max-w-lg">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="group inline-flex items-center gap-2 text-sm text-forest-deep hover:text-olive transition-colors w-fit">
          {linkLabel}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  )
}
