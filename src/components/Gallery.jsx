import { useEffect, useState } from 'react'
import './Gallery.css'

const modules = import.meta.glob('../photos/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
  import: 'default',
})

const photos = Object.keys(modules)
  .sort()
  .map((path) => ({
    src: modules[path],
    alt: path.split('/').pop().replace(/\.[^/.]+$/, ''),
  }))

function Gallery() {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (active === null) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + photos.length) % photos.length)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active])

  if (photos.length === 0) {
    return (
      <p className="gallery-empty">
        No photos yet — drop .jpg/.png files into <code>src/photos</code> and
        they'll show up here automatically.
      </p>
    )
  }

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            className="gallery-item"
            onClick={() => setActive(i)}
            aria-label={`Open ${photo.alt}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button className="lightbox-close" aria-label="Close">
            ×
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i - 1 + photos.length) % photos.length)
            }}
          >
            ‹
          </button>
          <img
            className="lightbox-image"
            src={photos[active].src}
            alt={photos[active].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav lightbox-next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i + 1) % photos.length)
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}

export default Gallery
