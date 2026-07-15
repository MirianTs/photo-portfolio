import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Gallery from './components/Gallery.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'

function App() {
  return (
    <>
      <Navbar />

      <section id="home" className="section">
        <Hero />
      </section>

      <section id="gallery" className="section">
        <span className="eyebrow">Portfolio</span>
        <h2 className="section-title">Gallery</h2>
        <Gallery />
      </section>

      <section id="about" className="section">
        <span className="eyebrow">About</span>
        <h2 className="section-title">Who I Am</h2>
        <About />
      </section>

      <section id="contact" className="section">
        <span className="eyebrow">Contact</span>
        <h2 className="section-title">Get In Touch</h2>
        <Contact />
      </section>
    </>
  )
}

export default App
