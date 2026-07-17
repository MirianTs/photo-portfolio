import { useEffect, useMemo, useState } from 'react'
import './Gallery.css'

const modules = import.meta.glob('../photos/**/*.{jpg,jpeg,png,webp,gif}', {
  eager: true,
  import: 'default',
})

const photos = Object.keys(modules)
  .sort()
  .map((path) => {
    const relative = path.replace('../photos/', '')
    const parts = relative.split('/')
    const category = parts.length > 1 ? parts[0] : 'uncategorized'
    const filename = parts[parts.length - 1]
    return {
      src: modules[path],
      alt: filename.replace(/\.[^/.]+$/, ''),
      category,
    }
  })

const categories = [...new Set(photos.map((p) => p.category))]

function Gallery() {
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)

  const filtered = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.category === filter)),
    [filter],
  )

  useEffect(() => {
    if (active === null) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + filtered.length) % filtered.length)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, filtered.length])

  if (photos.length === 0) {
    return (
      <p className="gallery-empty">
        No photos yet — drop .jpg/.png files into <code>src/photos</code> (put
        them in subfolders like <code>src/photos/nature</code> to group them
        into categories) and they'll show up here automatically.
      </p>
    )
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="gallery-filters">
          <button
            className={`gallery-filter ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => {
              setFilter('all')
              setActive(null)
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`gallery-filter ${filter === cat ? 'is-active' : ''}`}
              onClick={() => {
                setFilter(cat)
                setActive(null)
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="gallery-grid">
        {filtered.map((photo, i) => (
          <button
            key={photo.src}
            className="gallery-item"
            onClick={() => setActive(i)}
            aria-label={`Open ${photo.alt}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            />
          </button>
        ))}
      </div>

      {active !== null && filtered[active] && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <button className="lightbox-close" aria-label="Close">
            ×
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i - 1 + filtered.length) % filtered.length)
            }}
          >
            ‹
          </button>
          <img
            className="lightbox-image"
            src={filtered[active].src}
            alt={filtered[active].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav lightbox-next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => (i + 1) % filtered.length)
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
