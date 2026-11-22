import Reveal from './Reveal.jsx'
import './Contact.css'

// Fill in an href to show that profile; entries left empty stay hidden.
const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/fury_cyber/' },
  { label: 'Behance', href: '' },
]

function Contact() {
  return (
    <Reveal as="div" className="contact-info">
      <div className="glow-blob contact-glow" aria-hidden="true" />

      <p className="contact-lead">
        Interested in working together, licensing a photo, or just want to say{' '}
        <em>hello</em>? Reach out directly — replace these with your own
        details.
      </p>

      <a className="contact-email" href="mailto:you@example.com">
        you@example.com
      </a>

      <div className="contact-socials">
        {socials
          // A link without a real address would only reopen this page in a new tab.
          .filter((social) => social.href)
          .map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
              {social.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ))}
      </div>
    </Reveal>
  )
}

export default Contact
