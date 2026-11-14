import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.JPG'
import './Navbar.css'

const links = [
  { href: '#home', label: 'Home' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef(null)
  const toggleRef = useRef(null)

  // Let keyboard users close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      // Focus may be on a menu link that is about to be hidden; put it back
      // on the button that opened the menu so keyboard users are not lost.
      if (headerRef.current?.contains(document.activeElement)) toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Close the mobile menu when the user taps anywhere outside the navbar.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <header className="navbar" ref={headerRef}>
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand">
          <img src={logo} className="navbar-mark" alt="" aria-hidden="true" />
          Mirian Tsartsidze
        </a>

        <button
          ref={toggleRef}
          className={`navbar-toggle ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="navbar-links"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="navbar-links"
          className={`navbar-links ${open ? 'is-open' : ''}`}
          aria-label="Main"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
