import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// Inline blocks (inside a page that already has its own Navbar/Footer)
export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="py-24 flex flex-col items-center gap-4 text-forest-deep/60" role="status" aria-live="polite">
      <span className="h-8 w-8 rounded-full border-2 border-olive/30 border-t-olive animate-spin" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorBlock({ onRetry, message = "We couldn't reach the server. Check that the backend is running and try again." }) {
  return (
    <div className="py-20 text-center" role="alert">
      <p className="font-display text-2xl text-forest-deep mb-2">Something went wrong</p>
      <p className="text-sm text-forest-deep/60 max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm border-b border-olive text-forest-deep hover:text-olive transition-colors pb-1">
          Try again
        </button>
      )}
    </div>
  )
}

// Full-page versions (used by detail pages before their data has arrived)
export function PageLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-cream pt-32 flex items-start justify-center">
        <LoadingBlock />
      </main>
      <Footer />
    </>
  )
}

export function PageError({ onRetry }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-cream pt-32 flex items-start justify-center">
        <ErrorBlock onRetry={onRetry} />
      </main>
      <Footer />
    </>
  )
}
