import FeaturedMarket from '../components/discovery/FeaturedMarket.jsx'
import { useData } from '../context/DataContext.jsx'

export default function FeaturedMarketSection() {
  const { markets } = useData()
  const featured = markets[0]
  if (!featured) return null
  return (
    <section aria-label="Featured market">
      <FeaturedMarket market={featured} />
    </section>
  )
}
