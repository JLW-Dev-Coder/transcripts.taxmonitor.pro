'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './contact.module.css'

const SUPPORT_POST = 'https://transcript.taxmonitor.pro/v1/help/tickets'
const SUPPORT_STATUS_GET = 'https://transcript.taxmonitor.pro/v1/help/status?ticket_id='

type StatusKind = 'error' | 'info' | 'success'

interface LookupPayload {
  supportId?: string
  support_id?: string
  ticketId?: string
  ticket_id?: string
  statusLabel?: string
  status_label?: string
  status?: string
  supportStatus?: string
  support_status?: string
  latestUpdate?: string
  latest_update?: string
  message?: string
  note?: string
  updatedAt?: string
  updated_at?: string
  lastSyncedAt?: string
  last_synced_at?: string
  source?: string
  statusSource?: string
  error?: string
}

interface LookupDisplay {
  mainMessage: string
  meta: string[]
}

function firstDefined(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function formatIso(ts: string): string {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleString()
}

function newEventId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return 'evt_' + Date.now() + '_' + Math.random().toString(16).slice(2)
  }
}

function getParam(name: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return new URLSearchParams(window.location.search).get(name) || ''
  } catch {
    return ''
  }
}

function parseLookupPayload(payload: LookupPayload): LookupDisplay {
  const supportId = firstDefined(payload.supportId, payload.support_id, payload.ticket_id, payload.ticketId)
  const status = firstDefined(
    payload.statusLabel,
    payload.status_label,
    payload.status,
    payload.supportStatus,
    payload.support_status,
  )
  const latestUpdate = firstDefined(payload.latestUpdate, payload.latest_update, payload.message, payload.note)
  const updatedAt = firstDefined(
    payload.updatedAt,
    payload.updated_at,
    payload.lastSyncedAt,
    payload.last_synced_at,
  )
  const source = firstDefined(payload.source, payload.statusSource)

  const meta: string[] = []
  if (supportId) meta.push(`Support ID: ${supportId}`)
  if (status) meta.push(`Status: ${status}`)
  if (updatedAt) meta.push(`Updated: ${formatIso(updatedAt)}`)
  if (source) meta.push(`Source: ${source}`)

  return {
    mainMessage: latestUpdate || (!meta.length ? 'Your ticket is in progress. Please check back later.' : ''),
    meta,
  }
}

export default function ContactForm() {
  // Lookup state
  const [lookupId, setLookupId] = useState('')
  const [lookupStatus, setLookupStatus] = useState<StatusKind | null>(null)
  const [lookupDisplay, setLookupDisplay] = useState<LookupDisplay | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  // Form submission state
  const [formStatus, setFormStatus] = useState<StatusKind | null>(null)
  const [formMessage, setFormMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [supportIdShown, setSupportIdShown] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Controlled form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [issueType, setIssueType] = useState('')
  const [priority, setPriority] = useState('')
  const [urgency, setUrgency] = useState('')
  const [subject, setSubject] = useState('')
  const [messageText, setMessageText] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [relatedOrderId, setRelatedOrderId] = useState('')

  const eventIdRef = useRef(newEventId())

  useEffect(() => {
    const pref =
      getParam('ticket_id') || getParam('supportId') || getParam('support_id')
    if (pref) {
      setLookupId(pref)
      doLookup(pref)
    }
    const tokenParam = getParam('tokenId')
    if (tokenParam) setTokenId(tokenParam)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function doLookup(id: string) {
    const trimmed = id.trim()
    if (!trimmed) {
      setLookupStatus('error')
      setLookupDisplay({ mainMessage: 'Enter a Support ID to check status.', meta: [] })
      return
    }
    setLookupLoading(true)
    setLookupStatus('info')
    setLookupDisplay({ mainMessage: 'Checking status…', meta: [] })
    try {
      const res = await fetch(SUPPORT_STATUS_GET + encodeURIComponent(trimmed), {
        method: 'GET',
        credentials: 'omit',
      })
      let json: LookupPayload | null = null
      try {
        json = await res.json()
      } catch {
        json = null
      }
      if (!res.ok) {
        const msg =
          json && (json.error || json.message)
            ? String(json.error || json.message)
            : `Request failed (${res.status})`
        setLookupStatus('error')
        setLookupDisplay({ mainMessage: msg, meta: [] })
        return
      }
      setLookupStatus('success')
      setLookupDisplay(parseLookupPayload(json ?? {}))
    } catch {
      setLookupStatus('error')
      setLookupDisplay({ mainMessage: 'Network error. Please try again.', meta: [] })
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const missing: string[] = []
    if (!name) missing.push('name')
    if (!email) missing.push('email')
    if (!category) missing.push('category')
    if (!issueType) missing.push('issue type')
    if (!priority) missing.push('priority')
    if (!urgency) missing.push('urgency')
    if (!subject) missing.push('subject')
    if (!messageText) missing.push('message')

    if (missing.length) {
      setFormStatus('error')
      setFormMessage('Please fill in all required fields.')
      return
    }

    const payload: Record<string, string> = {
      category,
      email,
      eventId: eventIdRef.current,
      issueType,
      message: messageText,
      name,
      priority,
      subject,
      urgency,
    }

    const sessionToken = getParam('sessionToken')
    if (sessionToken) payload.sessionToken = sessionToken
    if (tokenId) payload.tokenId = tokenId
    if (relatedOrderId) payload.relatedOrderId = relatedOrderId

    for (const k of ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term']) {
      const v = getParam(k)
      if (v) payload[k] = v
    }

    setSubmitting(true)
    setFormStatus('info')
    setFormMessage('Submitting your ticket…')

    try {
      const res = await fetch(SUPPORT_POST, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let json: LookupPayload | null = null
      try {
        json = await res.json()
      } catch {
        json = null
      }

      if (!res.ok) {
        const msg =
          json && (json.error || json.message)
            ? String(json.error || json.message)
            : `Request failed (${res.status})`
        setFormStatus('error')
        setFormMessage(msg)
        return
      }

      const sid = firstDefined(
        json?.supportId,
        json?.support_id,
        json?.ticket_id,
        json?.ticketId,
      )

      if (sid) {
        setSupportIdShown(sid)
        setLookupId(sid)
        setFormStatus(null)
        setFormMessage('')
        try {
          const u = new URL(window.location.href)
          u.searchParams.set('ticket_id', sid)
          history.replaceState(null, '', u.toString())
        } catch {
          // ignore
        }
        doLookup(sid)
      } else {
        setFormStatus('success')
        setFormMessage('Ticket submitted. Check your email for your Support ID.')
      }

      setFormSubmitted(true)
      setName('')
      setEmail('')
      setCategory('')
      setIssueType('')
      setPriority('')
      setUrgency('')
      setSubject('')
      setMessageText('')
      setTokenId('')
      setRelatedOrderId('')
      eventIdRef.current = newEventId()
    } catch {
      setFormStatus('error')
      setFormMessage('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Left: static text */}
          <div className={styles.heroText}>
            <div className={styles.badge}>Transcript support</div>
            <h1 className={styles.heroTitle}>Contact Support</h1>
            <p className={styles.heroSub}>
              Submit a ticket for help with transcript parsing, report generation, credits, or
              account questions. You&apos;ll get a Support ID to track progress.
            </p>
            <div className={styles.heroCtas}>
              <a href="#support-form" className={styles.btnPrimary}>
                Create a ticket
              </a>
              <Link href="/#how-it-works" className={styles.btnSecondaryHero}>
                See How It Works
              </Link>
            </div>
            <p className={styles.heroDisclaimer}>
              No passwords. No SSNs. No full transcript attachments in the message box unless
              requested.
            </p>
          </div>

          {/* Right: lookup panel */}
          <div className={styles.lookupPanel}>
            <div className={styles.lookupPanelTop}>
              <span className={styles.badgeMini}>Support lookup</span>
              <span className={styles.lookupStatusLabel}>Status</span>
            </div>
            <p className={styles.lookupHint}>
              Already have a Support ID? Check transcript support status here.
            </p>
            <div className={styles.lookupRow}>
              <input
                type="text"
                className={styles.inputLight}
                placeholder="Support ID"
                autoComplete="off"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    doLookup(lookupId)
                  }
                }}
              />
              <button
                type="button"
                className={styles.btnGlass}
                onClick={() => doLookup(lookupId)}
                disabled={lookupLoading}
              >
                {lookupLoading ? 'Checking…' : 'Check status'}
              </button>
            </div>
            {lookupStatus && lookupDisplay && (
              <div
                className={`${styles.statusMsg} ${styles['statusMsg_' + lookupStatus]} ${styles.statusOnDark}`}
                role="status"
                aria-live="polite"
              >
                {lookupDisplay.mainMessage && (
                  <div className={styles.statusMain}>{lookupDisplay.mainMessage}</div>
                )}
                {lookupDisplay.meta.length > 0 && (
                  <div className={styles.statusMeta}>{lookupDisplay.meta.join(' • ')}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section id="support-form" className={styles.formSection}>
        <div className={styles.formSectionInner}>
          <div className={styles.formSectionHead}>
            <span className={styles.badgeAccent}>Create a ticket</span>
            <h2 className={styles.formTitle}>
              Tell us what&apos;s happening with the transcript
            </h2>
            <p className={styles.formSubtitle}>
              We&apos;ll reply by email and include a Support ID for tracking.
            </p>
          </div>

          <div className={styles.formCard}>
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid2}>
                  <div className={styles.field}>
                    <label htmlFor="cf-name" className={styles.label}>
                      Name *
                    </label>
                    <input
                      id="cf-name"
                      className={styles.inputLight}
                      placeholder="Your name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cf-email" className={styles.label}>
                      Email *
                    </label>
                    <input
                      id="cf-email"
                      type="email"
                      className={styles.inputLight}
                      placeholder="you@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className={`${styles.formGrid2} ${styles.fieldGap}`}>
                  <div className={styles.field}>
                    <label htmlFor="cf-category" className={styles.label}>
                      Category *
                    </label>
                    <select
                      id="cf-category"
                      className={styles.selectLight}
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled hidden />
                      <option>Access / Portal</option>
                      <option>Account / Reports / Monitoring</option>
                      <option>Billing / Credits</option>
                      <option>General</option>
                      <option>Other</option>
                      <option>Parsing</option>
                      <option>Transcript Report</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cf-issueType" className={styles.label}>
                      Issue Type *
                    </label>
                    <select
                      id="cf-issueType"
                      className={styles.selectLight}
                      required
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="" disabled hidden />
                      <option>Account</option>
                      <option>Billing</option>
                      <option>Credits</option>
                      <option>Other</option>
                      <option>Parsing</option>
                      <option>Report</option>
                      <option>Token</option>
                      <option>Transcript Code Question</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.formGrid2} ${styles.fieldGap}`}>
                  <div className={styles.field}>
                    <label htmlFor="cf-priority" className={styles.label}>
                      Priority *
                    </label>
                    <select
                      id="cf-priority"
                      className={styles.selectLight}
                      required
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="" disabled hidden />
                      <option>Critical</option>
                      <option>High</option>
                      <option>Low</option>
                      <option>Normal</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cf-urgency" className={styles.label}>
                      Urgency *
                    </label>
                    <select
                      id="cf-urgency"
                      className={styles.selectLight}
                      required
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="" disabled hidden />
                      <option>Normal</option>
                      <option>Time-sensitive (deadline)</option>
                      <option>Urgent (service blocked)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGap}>
                  <label htmlFor="cf-subject" className={styles.label}>
                    Subject *
                  </label>
                  <input
                    id="cf-subject"
                    className={styles.inputLight}
                    placeholder="e.g., Client transcript will not parse"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGap}>
                  <label htmlFor="cf-message" className={styles.label}>
                    Message *
                  </label>
                  <textarea
                    id="cf-message"
                    rows={5}
                    className={styles.textareaLight}
                    placeholder="What happened, what you expected, the transcript year or type, and any error message"
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <p className={styles.fieldHint}>
                    Include steps to reproduce, exact error text, and what outcome you expected.
                    Don&apos;t include sensitive info.
                  </p>
                </div>

                <div className={`${styles.formGrid2} ${styles.fieldGap}`}>
                  <div className={styles.field}>
                    <label htmlFor="cf-tokenId" className={styles.label}>
                      Token ID
                    </label>
                    <input
                      id="cf-tokenId"
                      className={styles.inputLight}
                      placeholder="Optional"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cf-relatedOrderId" className={styles.label}>
                      Related ID
                    </label>
                    <input
                      id="cf-relatedOrderId"
                      className={styles.inputLight}
                      placeholder="Optional (credit purchase ID, Stripe ID, reference, etc.)"
                      value={relatedOrderId}
                      onChange={(e) => setRelatedOrderId(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.submitArea}>
                  <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit ticket'}
                  </button>
                  <p className={styles.legalNote}>
                    By submitting, you agree to our{' '}
                    <Link href="/legal/terms" className={styles.legalLink}>
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/legal/privacy" className={styles.legalLink}>
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                {formStatus && (
                  <div
                    className={`${styles.statusMsg} ${styles['statusMsg_' + formStatus]}`}
                    role="status"
                    aria-live="polite"
                  >
                    {formMessage}
                  </div>
                )}
              </form>
            ) : (
              <>
                {formStatus && (
                  <div
                    className={`${styles.statusMsg} ${styles['statusMsg_' + formStatus]}`}
                    role="status"
                    aria-live="polite"
                  >
                    {formMessage}
                  </div>
                )}
                {supportIdShown && (
                  <div className={styles.supportIdDisplay}>
                    <p className={styles.supportIdLabel}>Your Support ID</p>
                    <div className={styles.supportIdValue}>{supportIdShown}</div>
                    <p className={styles.supportIdNote}>
                      We&apos;ve emailed confirmation. Keep this ID for transcript support status
                      checks.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
