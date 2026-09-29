import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SceneContent from './SceneContent.jsx'

/**
 * A single full-viewport (~100vh) scene in the cinematic scroll story.
 * The background video (CinematicBackground) stays fixed behind every
 * ScrollScene; this component only animates its own foreground content
 * (text + image) in and out based on how far it has scrolled through
 * the viewport, so the video is never reloaded between scenes.
 */
export default function ScrollScene({ scene, index }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'center center', 'end 0.15']
  })

  // Fade + slight scale/lift as the scene enters and leaves the viewport.
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [40, 0, 0, -40])
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08])
  const imageParallaxY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  const imageOnRight = scene.align === 'left'

  return (
    <section
      ref={ref}
      id={index === 0 ? 'home' : undefined}
      className="relative min-h-screen flex items-center"
    >
      <div className="container-page w-full">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
            imageOnRight ? '' : 'md:[&>*:first-child]:order-2'
          }`}
        >
          <motion.div style={{ opacity, y }}>
            <SceneContent
              eyebrow={scene.eyebrow}
              title={scene.title}
              description={scene.description}
              cta={scene.cta}
              align={imageOnRight ? 'left' : 'right'}
            />
          </motion.div>

          <motion.div
            style={{ opacity }}
            className="relative aspect-[4/5] w-full max-w-md mx-auto overflow-hidden"
          >
            <motion.img
              src={scene.image}
              alt=""
              style={{ scale: imageScale, y: imageParallaxY }}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 border border-cream/15 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
