import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Reveal from './Reveal.jsx'
import './Gallery.css'

function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('photos')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setLoadError(true)
        else setPhotos(data || [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => [...new Set(photos.map((p) => p.category))], [photos])

  const filtered = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.category === filter)),
    [filter, photos],
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

  if (loading) {
    return <p className="gallery-empty">Loading photos…</p>
  }

  if (loadError) {
    return <p className="gallery-empty">Couldn't load photos right now — try refreshing.</p>
  }

  if (photos.length === 0) {
    return (
      <p className="gallery-empty">
        No photos yet — head to <code>/admin</code> to upload your first ones.
      </p>
    )
  }

  return (
    <>
      {categories.length > 1 && (
        <Reveal as="div" className="gallery-filters">
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
        </Reveal>
      )}

      <div className="gallery-grid">
        {filtered.map((photo, i) => (
          <Reveal
            as="button"
            key={photo.id}
            delay={(i % 6) * 0.07}
            className="gallery-item"
            onClick={() => setActive(i)}
            aria-label="Open photo"
          >
            <img
              src={photo.url}
              alt=""
              onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            />
          </Reveal>
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
            src={filtered[active].url}
            alt=""
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
