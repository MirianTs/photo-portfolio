import Reveal from './Reveal.jsx'
import './Contact.css'

function Contact() {
  return (
    <Reveal as="div" className="contact-info">
      <div className="glow-blob contact-glow" />

      <p className="contact-lead">
        Interested in working together, licensing a photo, or just want to say{' '}
        <em>hello</em>? Reach out directly — replace these with your own
        details.
      </p>

      <a className="contact-email" href="mailto:you@example.com">
        you@example.com
      </a>

      <div className="contact-socials">
        <a href="#" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="#" target="_blank" rel="noreferrer">
          Behance
        </a>
      </div>
    </Reveal>
  )
}

export default Contact
