import Reveal from './Reveal.jsx'
import './About.css'

const facts = [
  { label: 'Based in', value: 'Your City' },
  { label: 'Focus', value: 'Street & Nature' },
  { label: 'Camera', value: 'Your Gear' },
  { label: 'Shooting since', value: 'Year' },
]

function About() {
  return (
    <div className="about">
      <Reveal as="div" className="about-card">
        <h3>
          Placeholder heading about <em>you</em>
        </h3>
        <p>
          This is a placeholder paragraph where you can talk about your
          background, your gear, your favorite subjects to shoot, and what
          drew you to photography. Replace it with your own bio.
        </p>
      </Reveal>

      <div className="about-facts">
        {facts.map((fact, i) => (
          <Reveal as="div" key={fact.label} delay={0.1 + i * 0.08} className="about-fact">
            <span className="about-fact-label">{fact.label}</span>
            <span className="about-fact-value">{fact.value}</span>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export default About
