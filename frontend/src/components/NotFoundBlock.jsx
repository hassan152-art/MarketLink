import { Link } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// Shared "nothing here" screen for unknown ids and unknown URLs.
export default function NotFoundBlock({ title = 'Page not found', message = 'The page you are looking for does not exist.', backTo = '/', backLabel = 'Back to MarketLink' }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-cream flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <h1 className="font-display text-4xl md:text-5xl text-forest-deep mb-4">{title}</h1>
        <p className="text-forest-deep/65 max-w-md mb-8">{message}</p>
        <Link to={backTo} className="text-sm border-b border-olive text-forest-deep hover:text-olive transition-colors pb-1">
          {backLabel}
        </Link>
      </main>
      <Footer />
    </>
  )
}
