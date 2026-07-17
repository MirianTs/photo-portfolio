import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Gallery from './components/Gallery.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Reveal from './components/Reveal.jsx'

function App() {
  return (
    <>
      <Navbar />

      <section id="home" className="section">
        <Hero />
      </section>

      <section id="gallery" className="section">
        <Reveal>
          <span className="eyebrow">Portfolio</span>
          <h2 className="section-title">
            Captured <em>Moments</em>
          </h2>
        </Reveal>
        <Gallery />
      </section>

      <section id="about" className="section">
        <Reveal>
          <span className="eyebrow">About</span>
          <h2 className="section-title">
            Who I <em>Am</em>
          </h2>
        </Reveal>
        <About />
      </section>

      <section id="contact" className="section">
        <Reveal>
          <span className="eyebrow">Contact</span>
          <h2 className="section-title">
            Let's <em>Connect</em>
          </h2>
        </Reveal>
        <Contact />
      </section>
    </>
  )
}

export default App
