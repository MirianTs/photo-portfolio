import { useEffect, useState } from 'react'
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

  // Let keyboard users close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand">
          <img src={logo} className="navbar-mark" alt="" aria-hidden="true" />
          Mirian Tsartsidze
        </a>

        <button
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
