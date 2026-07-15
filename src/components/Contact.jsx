import './Contact.css'

function Contact() {
  return (
    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" placeholder="Your name" />
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" />
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Say hello..."
        />
      </div>

      <button type="submit" className="form-submit">
        Send Message
      </button>
    </form>
  )
}

export default Contact
