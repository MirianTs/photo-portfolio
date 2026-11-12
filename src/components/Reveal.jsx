import { useEffect, useRef } from 'react'

// Fades its children in the first time they scroll into view.
// `as` picks the rendered element, `delay` (seconds) staggers neighbours, and
// any other props (aria-*, onClick, id…) are passed straight to the element.
// The animation itself lives in the .reveal rules in index.css.
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Old browsers without IntersectionObserver: show the content right away.
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.unobserve(node)
        }
      },
      // Wait until 15% of the element is on screen so the fade is noticeable.
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}s` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
