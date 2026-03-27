'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './lead-magnet.module.css'

export default function LeadMagnetForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = e.currentTarget
    const name = (form.elements.namedItem('lead-name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('lead-email') as HTMLInputElement).value.trim()

    if (!name) {
      setError('Please enter your full name.')
      return
    }
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setSubmitting(true)
    router.push('/magnets/guide')
  }

  return (
    <div className={styles.formCard}>
      <h3 className={styles.formTitle}>Get Instant Access</h3>
      <p className={styles.formSub}>Enter your details below</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label htmlFor="lead-name" className={styles.label}>Full Name</label>
            <input
              type="text"
              id="lead-name"
              name="lead-name"
              placeholder="John Smith"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="lead-email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="lead-email"
              name="lead-email"
              placeholder="john@taxfirm.com"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="lead-firm" className={styles.label}>Firm Name (Optional)</label>
            <input
              type="text"
              id="lead-firm"
              name="lead-firm"
              placeholder="Smith Tax Services"
              className={styles.input}
            />
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={submitting}
        >
          Download Free Guide →
        </button>

        <p className={styles.finePrint}>We respect your privacy. Unsubscribe anytime.</p>

        {error && (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
