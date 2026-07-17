import Reveal from './Reveal.jsx'
import './Hero.css'

function Hero() {
  return (
    <div className="hero">
      <div className="glow-blob hero-glow-1" />
      <div className="glow-blob hero-glow-2" />

      <Reveal className="hero-badge">
        <span className="hero-badge-dot" />
        Available for shoots
      </Reveal>

      <Reveal as="h1" className="hero-title" delay={0.1}>
        Your Name — I tell stories through <em>light &amp; motion</em>.
      </Reveal>

      <Reveal delay={0.2}>
        <p className="hero-text">
          Placeholder text about your photography style and passion. Replace
          this with your own story — the places you shoot, the mood you
          chase, the moments you can't stop chasing with a camera.
        </p>
      </Reveal>

      <Reveal delay={0.3} className="hero-actions">
        <a href="#gallery" className="hero-cta">
          View Gallery
          <span className="hero-cta-arrow">→</span>
        </a>
        <a href="#contact" className="hero-cta hero-cta-ghost">
          Get In Touch
        </a>
      </Reveal>
    </div>
  )
}

export default Hero
