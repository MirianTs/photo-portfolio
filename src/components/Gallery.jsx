import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import Reveal from './Reveal.jsx'
import './Gallery.css'

// Step through the photos in a loop: past the last one comes the first again.
const wrapIndex = (index, length) => (index + length) % length

function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const closeButtonRef = useRef(null)
  const lightboxRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('photos')
      .select('id, url, category')
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

  // Filter buttons follow the order categories first appear in the gallery,
  // which is the order set by dragging photos in the admin panel.
  const categories = useMemo(() => [...new Set(photos.map((p) => p.category))], [photos])

  const filtered = useMemo(
    () => (filter === 'all' ? photos : photos.filter((p) => p.category === filter)),
    [filter, photos],
  )

  useEffect(() => {
    if (active === null) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => wrapIndex(i + 1, filtered.length))
      if (e.key === 'ArrowLeft') setActive((i) => wrapIndex(i - 1, filtered.length))

      // Keep Tab cycling through the lightbox buttons instead of the page behind it.
      if (e.key === 'Tab' && lightboxRef.current) {
        const buttons = [...lightboxRef.current.querySelectorAll('button')]
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (!lightboxRef.current.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, filtered.length])

  // Keep the page behind the lightbox from scrolling while it is open.
  const isOpen = active !== null
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Move keyboard focus into the lightbox when it opens and give it back to
  // the thumbnail that opened it when it closes.
  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement
    closeButtonRef.current?.focus()
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [isOpen])

  if (loading) {
    return (
      <p className="gallery-empty" role="status">
        Loading photos…
      </p>
    )
  }

  if (loadError) {
    return (
      <p className="gallery-empty" role="alert">
        Couldn't load photos right now — try refreshing.
      </p>
    )
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
        <Reveal
          as="div"
          className="gallery-filters"
          role="group"
          aria-label="Filter photos by category"
        >
          <button
            className={`gallery-filter ${filter === 'all' ? 'is-active' : ''}`}
            aria-pressed={filter === 'all'}
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
              aria-pressed={filter === cat}
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
            // Stagger the fade-in in small groups so photos far down the
            // list do not wait seconds for their turn.
            delay={(i % 6) * 0.07}
            className="gallery-item"
            onClick={() => setActive(i)}
            aria-label={`Open ${photo.category} photo ${i + 1} of ${filtered.length}`}
          >
            <img
              src={photo.url}
              loading="lazy"
              decoding="async"
              alt=""
              onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
            />
          </Reveal>
        ))}
      </div>

      {active !== null && filtered[active] && (
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setActive(null)}
        >
          <button
            ref={closeButtonRef}
            className="lightbox-close"
            aria-label="Close photo viewer"
            onClick={(e) => {
              e.stopPropagation()
              setActive(null)
            }}
          >
            ×
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => wrapIndex(i - 1, filtered.length))
            }}
          >
            ‹
          </button>
          <img
            className="lightbox-image"
            src={filtered[active].url}
            alt={`${filtered[active].category}, ${active + 1} of ${filtered.length}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav lightbox-next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              setActive((i) => wrapIndex(i + 1, filtered.length))
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
