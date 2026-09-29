import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StoryImage from './StoryImage.jsx'
import SceneProgress from './SceneProgress.jsx'
import CTAButton from '../CTAButton.jsx'

gsap.registerPlugin(ScrollTrigger)

/**
 * The sticky, scroll-pinned viewport for the cinematic product story.
 * The outer wrapper is `scenes.length * 100vh` tall; the inner content
 * is CSS `position: sticky`, so it stays pinned to the viewport for the
 * whole scroll range without GSAP's DOM-mutating pin (safer with React).
 * A single GSAP ScrollTrigger (scrub, no pin) just tracks scroll
 * progress across that tall wrapper and maps it to an active scene
 * index — the one background video keeps playing underneath the whole
 * time and is never remounted between scenes.
 */
export default function CinematicScene({ scenes, onExploreProducts }) {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length))
          setActiveIndex(idx)
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [scenes.length])

  const active = scenes[activeIndex]

  return (
    <div ref={containerRef} style={{ height: `${scenes.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-forest-deep">
        {!videoFailed ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={active.image}
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/marketlink-products.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 30% 20%, #1E3F30 0%, #122A20 45%, #0B1D15 100%)' }}
          />
        )}

        {/* Moderate overlay — keeps text readable without hiding the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/55 via-forest-deep/30 to-forest-deep/60" />

        <div className="relative h-full container-page flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-8 md:gap-14 items-center w-full">
            <div className="order-2 md:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="max-w-lg"
                >
                  <span className="block text-olive-light text-xs md:text-sm tracking-widest2 uppercase font-body mb-4">
                    {active.eyebrow}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.08]">
                    {active.title}
                  </h2>
                  <p className="mt-5 text-cream/80 text-base md:text-lg leading-relaxed">{active.description}</p>
                  {active.cta && (
                    <CTAButton variant="outline" className="mt-7" onClick={onExploreProducts}>
                      {active.cta}
                    </CTAButton>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="order-1 md:order-2">
              <StoryImage image={active.image} alt={active.title} floatingProduct={active.floatingProduct} />
            </div>
          </div>
        </div>

        <SceneProgress scenes={scenes} activeIndex={activeIndex} />
      </div>
    </div>
  )
}
