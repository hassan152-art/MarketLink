// Scene data for the Step 3 cinematic product story (CinematicProductSection).
// progressLabel feeds the vertical/horizontal scene progress indicator.
// floatingProductId links a scene to a real product from the API (resolved in
// CinematicProductSection) so the floating info panel shows real data.

export const productStory = [
  {
    id: 1,
    progressLabel: 'Farm',
    eyebrow: 'From the Farm',
    title: 'Freshness Starts at the Source',
    description: 'Discover fresh produce grown by local farmers and brought closer to your community.',
    image: '/images/story/farm-fresh.svg'
  },
  {
    id: 2,
    progressLabel: 'Farmers',
    eyebrow: 'Local Farmers',
    title: 'Know the People Behind Your Food',
    description: 'Meet local farmers, learn what they grow and discover where your food comes from.',
    image: '/images/story/farmer-portrait.svg'
  },
  {
    id: 3,
    progressLabel: 'Produce',
    eyebrow: 'Fresh Produce',
    title: 'Picked Fresh. Shared Locally.',
    description: 'Explore vegetables, fruits, herbs and other products available from local farmers.',
    image: '/images/story/fresh-produce.svg',
    floatingProductId: 1
  },
  {
    id: 4,
    progressLabel: 'Products',
    eyebrow: 'Your Choice',
    title: 'Choose What You Need',
    description: 'Compare products, prices and availability before deciding what to pick up.',
    image: '/images/story/product-collection.svg',
    floatingProductId: 3
  },
  {
    id: 5,
    progressLabel: 'Community',
    eyebrow: 'Local Connection',
    title: 'From Local Hands to Your Table',
    description: 'MarketLink brings farmers, markets and customers together in one connected experience.',
    image: '/images/story/market-community.svg',
    cta: 'Explore Products'
  }
]
