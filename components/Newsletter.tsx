// components/Newsletter.tsx
'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle newsletter signup
    if (email) {
      console.log('Newsletter signup:', email)
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="newsletter-banner">
      {/* Newsletter Content - from index.html */}
      <div className="newsletter-content">
        <h2>
          JOIN THE <span className="highlight-text">BOUJEE</span> FAMILY ✨
        </h2>
        <p>
          Subscribe to receive 10% off your first order, exclusive access to
          new drops, and styling tips.
        </p>

        {/* Newsletter Form - from index.html */}
        <form className="newsletter-form-large" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            {submitted ? '✓ Thank You!' : 'SUBSCRIBE'}
          </button>
        </form>

        {submitted && (
          <p style={{ marginTop: '1rem', color: '#d4a574', fontSize: '0.9rem' }}>
            Thank you for subscribing!
          </p>
        )}
      </div>
    </section>
  )
}
