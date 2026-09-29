import { useState } from 'react'

/**
 * Full-screen, fixed video background used behind the scroll-driven
 * scenes on the homepage. Stays mounted for the whole scroll experience
 * so the video never reloads between scenes. Falls back to the poster
 * image if the video source is missing or fails to load.
 */
export default function CinematicBackground({ src = '/videos/marketlink-hero.mp4', poster = '/images/farm-1.svg' }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-forest-deep">
      {/* Always-present still: shows until the video plays, and stays if the video is missing */}
      <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />

      {!failed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}

      {/* Readability overlay: dark green wash, stronger at the bottom for text */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/50 to-forest-deep/80" />
      <div className="absolute inset-0 bg-forest-deep/20" />
    </div>
  )
}
