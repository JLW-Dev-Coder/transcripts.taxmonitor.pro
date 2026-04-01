'use client'

import { useState } from 'react'
import styles from './section-7216.module.css'

/* ── Copy Block ─────────────────────────────────────────── */
export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <pre className={styles.consentBlock}>{text}</pre>
      <button
        onClick={handleCopy}
        className={copied ? styles.copyBtnCopied : styles.copyBtn}
        aria-label="Copy text to clipboard"
      >
        {copied ? '✓ Copied!' : '⧉ Copy Text'}
      </button>
    </>
  )
}

/* ── Compliance Checklist ───────────────────────────────── */
const CHECKLIST_ITEMS = [
  {
    label: 'Affirmative Consent Obtained:',
    desc: 'Written, signed consent received BEFORE AI processing',
  },
  {
    label: 'SSN & PII Protection:',
    desc: 'Confirmed AI vendor uses encryption and data minimization',
  },
  {
    label: 'Consent Duration Set:',
    desc: 'Consent valid for one tax year or until revoked',
  },
  {
    label: 'Vendor Safeguards:',
    desc: 'AI vendor contract includes confidentiality, data retention, and compliance obligations',
  },
  {
    label: 'No Pre-Checked Boxes:',
    desc: 'Consent is affirmative, not default or conditional',
  },
  {
    label: 'Foreign Vendor Review:',
    desc: 'If applicable, reviewed latest IRS guidance for foreign-based AI services',
  },
  {
    label: 'Client File Documentation:',
    desc: 'Signed consent forms retained in client files',
  },
]

export function ComplianceChecklist() {
  const [checked, setChecked] = useState<boolean[]>(
    Array(CHECKLIST_ITEMS.length).fill(false)
  )

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  return (
    <div>
      {CHECKLIST_ITEMS.map((item, i) => (
        <div
          key={item.label}
          className={styles.checklistItem}
          onClick={() => toggle(i)}
          role="checkbox"
          aria-checked={checked[i]}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggle(i) }}
        >
          <div className={checked[i] ? styles.checklistBoxChecked : styles.checklistBox}>
            {checked[i] ? '✓' : ''}
          </div>
          <div className={styles.checklistText}>
            <strong>{item.label}</strong> {item.desc}
          </div>
        </div>
      ))}
    </div>
  )
}
