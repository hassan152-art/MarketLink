import CinematicScene from '../components/cinematic/CinematicScene.jsx'
import { useMemo } from 'react'
import { productStory } from '../data/productStory.js'
import { useData } from '../context/DataContext.jsx'

/**
 * Thin section wrapper around CinematicScene — keeps scene content
 * (data/productStory.js) separate from the scroll/animation mechanics
 * (components/cinematic/CinematicScene.jsx), matching the pattern
 * already used for the Step 1 hero story (StorySection + ScrollScene).
 */
export default function CinematicProductSection({ onExploreProducts }) {
  const { products } = useData()

  // Scenes reference products by id; attach the real product once it has loaded.
  const scenes = useMemo(
    () => productStory.map((s) => ({ ...s, floatingProduct: s.floatingProductId ? products.find((p) => p.id === s.floatingProductId) : undefined })),
    [products]
  )

  return (
    <section aria-label="Product story">
      <CinematicScene scenes={scenes} onExploreProducts={onExploreProducts} />
    </section>
  )
}
