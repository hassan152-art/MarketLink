import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import NotFoundBlock from '../components/NotFoundBlock.jsx'
import ProductCard from '../components/discovery/ProductCard.jsx'
import FarmerCard from '../components/discovery/FarmerCard.jsx'
import { PageLoading, PageError } from '../components/PageState.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { useData } from '../context/DataContext.jsx'

export default function FarmerDetails() {
  const { id } = useParams()
  const { data: farmer, status, retry } = useFetch(`/farmers/${id}`)
  const { farmers } = useData()

  if (status === 'loading') return <PageLoading />
  if (status === 'error') return <PageError onRetry={retry} />
  if (status === 'notfound') {
    return (
      <NotFoundBlock
        title="Farmer not found"
        message="We couldn't find that farmer profile."
        backTo="/farmers"
        backLabel="Back to all farmers"
      />
    )
  }

  const market = farmer.marketInfo
  const farmerProducts = farmer.productList
  const others = farmers.filter((f) => f.id !== farmer.id).slice(0, 3)
  const stars = Math.round(farmer.rating)

  return (
    <>
      <Navbar />
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Farmers', to: '/farmers' }, { label: farmer.name }]}
        title={farmer.farm}
        description={`${farmer.specialty}, grown by ${farmer.name} near ${farmer.location}.`}
      />

      <main className="bg-cream">
        <section className="container-page py-16 md:py-20 grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14">
          <div className="md:col-span-2 relative aspect-[3/4] overflow-hidden rounded-lg bg-forest-light max-w-sm md:max-w-none">
            <img
              src={farmer.image}
              alt={farmer.name}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="md:col-span-3 flex flex-col justify-center">
            <p className="font-display text-3xl md:text-4xl text-forest-deep leading-tight">{farmer.name}</p>
            <div className="flex items-center gap-2 mt-3 text-olive" aria-label={`Rated ${farmer.rating} out of 5`}>
              <span aria-hidden="true">
                {'★'.repeat(stars)}
                {'☆'.repeat(5 - stars)}
              </span>
              <span className="text-sm text-forest-deep/60">{farmer.rating}</span>
            </div>

            <p className="mt-6 text-forest-deep/70 leading-relaxed max-w-lg">
              {farmer.farm} specialises in {farmer.specialty.toLowerCase()}, grown around {farmer.location}. You can find {farmer.name.split(' ')[0]}'s
              produce at {market ? market.name : farmer.market}, with {farmer.products} items listed on MarketLink.
            </p>

            <dl className="mt-8 divide-y divide-forest/10 border-y border-forest/10 text-sm max-w-lg">
              {[
                ['Specialty', farmer.specialty],
                ['Farm location', farmer.location],
                ['Products listed', farmer.products]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-forest-deep/55">{k}</dt>
                  <dd className="text-forest-deep text-right">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-6 py-3.5">
                <dt className="text-forest-deep/55">Sells at</dt>
                <dd className="text-right">
                  {market ? (
                    <Link to={`/markets/${market.id}`} className="text-forest-deep hover:text-olive transition-colors">
                      {market.name}
                    </Link>
                  ) : (
                    <span className="text-forest-deep">{farmer.market}</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {farmerProducts.length > 0 && (
          <section className="container-page pb-16 md:pb-20">
            <SectionHeading title={`From ${farmer.farm}`} subtitle="What's on the stall right now." linkTo="/products" linkLabel="All products" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {farmerProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <section className="container-page pb-24">
          <SectionHeading title="More farmers" linkTo="/farmers" linkLabel="All farmers" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {others.map((f) => (
              <FarmerCard key={f.id} farmer={f} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
