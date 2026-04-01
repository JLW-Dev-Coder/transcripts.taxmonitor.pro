'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

import styles from './dashboard.module.css'
import { getTokenBalance, getTokenPricing, purchaseTokens, type TokenPackage } from '@/lib/api'

const WORKER_BASE = 'https://api.virtuallaunch.pro'
const PDFJS_VERSION = '3.11.174'

interface Session {
  email: string
  tokenId: string
  balance: number
}

type Step = 1 | 2 | 3

function getCodeDescription(code: string): string {
  const CODES: Record<string, string> = {
    '000': 'Establishment of tax module',
    '011': 'Entity created by TC 011',
    '014': 'Address change',
    '015': 'Address change — international',
    '020': 'Name change',
    '036': 'Reactivate tax module',
    '054': 'Amended return filed',
    '076': 'Duplicate return filed',
    '150': 'Tax return filed — liability established',
    '151': 'Tax return filed — liability reduced',
    '152': 'Tax return filed — no liability',
    '160': 'Failure-to-file penalty assessed',
    '161': 'Failure-to-file penalty abated',
    '166': 'Failure-to-pay penalty assessed',
    '167': 'Failure-to-pay penalty abated',
    '170': 'Estimated tax penalty assessed',
    '171': 'Estimated tax penalty abated',
    '196': 'Interest assessed',
    '197': 'Interest abated',
    '290': 'Additional tax assessed',
    '291': 'Tax decreased',
    '295': 'Additional tax reduced',
    '300': 'Additional tax assessed — examination',
    '301': 'Tax decreased — examination',
    '320': 'Failure-to-file penalty assessed — examination',
    '321': 'Failure-to-file penalty abated — examination',
    '336': 'Failure-to-pay penalty assessed — examination',
    '340': 'Estimated tax penalty assessed — examination',
    '360': 'Interest assessed — examination',
    '370': 'Credit transferred from another module',
    '400': 'Earned income credit applied',
    '402': 'Earned income credit reversed',
    '403': 'Earned income credit applied',
    '404': 'Earned income credit reversed',
    '405': 'Amended return filed — tax assessed',
    '420': 'Examination of tax return initiated',
    '421': 'Examination of tax return closed — no change',
    '424': 'Examination referral — return examined',
    '425': 'Examination referral reversed',
    '430': 'Estimated tax payment',
    '460': 'Extension of time to file granted',
    '470': 'Collection action suspended',
    '480': 'Offer in compromise pending',
    '481': 'Offer in compromise rejected',
    '482': 'Offer in compromise accepted',
    '494': 'Offer in compromise — suspension of collection',
    '500': 'Installment agreement granted',
    '503': 'Installment agreement terminated',
    '520': 'Collection suspended — litigation',
    '521': 'Collection suspension released',
    '530': 'Currently not collectible status',
    '531': 'Currently not collectible status released',
    '534': 'Currently not collectible — unable to locate',
    '570': 'Additional liability pending — hold on refund',
    '571': 'Resolved additional liability — hold released',
    '582': 'Federal tax lien filed',
    '583': 'Federal tax lien released',
    '590': 'Statute of limitations extended',
    '591': 'Statute of limitations extension released',
    '600': 'Penalty for underpayment of estimated tax',
    '601': 'Penalty for underpayment abated',
    '605': 'Failure-to-pay penalty',
    '606': 'Failure-to-pay penalty abated',
    '610': 'Remittance with return',
    '650': 'Payment received',
    '660': 'Additional payment received',
    '670': 'Payment applied',
    '680': 'Designated payment',
    '690': 'Penalty credit applied',
    '700': 'Credit applied from another period',
    '710': 'Excess collection applied',
    '716': 'Credit transferred to another module',
    '720': 'Refundable credit applied',
    '730': 'Backup withholding credit',
    '740': 'Undelivered refund returned',
    '766': 'Credit to account — refundable credit',
    '767': 'Credit reversed',
    '768': 'Earned income credit applied',
    '769': 'Earned income credit reversed',
    '770': 'Interest credited to account',
    '771': 'Interest reversed',
    '776': 'Interest assessed',
    '777': 'Interest reversed',
    '780': 'Offer in compromise — partial payment',
    '800': 'Withholding credit applied',
    '806': 'Federal tax withholding credit applied',
    '807': 'Withholding credit reversed',
    '810': 'Refund freeze',
    '811': 'Refund freeze released',
    '820': 'Credit transferred to another account',
    '821': 'Credit transfer reversed',
    '826': 'Credit transferred — overpayment applied to balance',
    '830': 'Overpayment credit waived',
    '840': 'Manual refund issued',
    '841': 'Manual refund reversed',
    '843': 'Refund abatement',
    '846': 'Refund issued',
    '847': 'Refund reversed',
    '898': 'Refund applied to non-tax debt (TOP offset)',
    '899': 'Reversal of TOP offset',
    '971': 'Notice issued to taxpayer',
    '972': 'Notice rescinded',
    '976': 'Duplicate return filed — sequenced',
    '977': 'Amended return filed — sequenced',
    '983': 'Refund held — identity theft',
    '990': 'Statute of limitations expiration date extended',
  }
  return CODES[code] || `IRS Transaction Code ${code}`
}

export default function DashboardClient() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>(1)
  const [balance, setBalance] = useState(0)
  const [rawText, setRawText] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [pdfFileName, setPdfFileName] = useState('')
  const [pdfReady, setPdfReady] = useState(false)
  const [reportEventId, setReportEventId] = useState('')
  const [reportUrl, setReportUrl] = useState('')
  const [previewSaved, setPreviewSaved] = useState(false)
  const [previewStatus, setPreviewStatus] = useState('Runs in your browser. Your PDF is not uploaded or stored.')
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState('Not ready.')
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoFileName, setLogoFileName] = useState('')
  const [copyRawLabel, setCopyRawLabel] = useState('Copy')
  const [copyJsonLabel, setCopyJsonLabel] = useState('Copy')
  const [dragging, setDragging] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [pricingPackages, setPricingPackages] = useState<TokenPackage[]>([])
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [modalError, setModalError] = useState('')

  const pdfjsRef = useRef<any>(null)
  const pdfFileRef = useRef<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load PDF.js dynamically
    const script = document.createElement('script')
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`
        pdfjsRef.current = lib
      }
    }
    document.head.appendChild(script)

    // Load saved logo
    const saved = localStorage.getItem('tm_brand_logo')
    if (saved) setLogoDataUrl(saved)

    // Fetch session using Bearer token from sessionStorage
    ;(async () => {
      const sessionId = sessionStorage.getItem('ttmp_session_id')
      const email = sessionStorage.getItem('ttmp_email')

      if (!sessionId) {
        window.location.href = '/login/'
        return
      }

      try {
        const res = await fetch(`${WORKER_BASE}/v1/auth/session`, {
          headers: { 'Authorization': `Bearer ${sessionId}` },
          credentials: 'include',
        })

        if (!res.ok) {
          sessionStorage.removeItem('ttmp_session_id')
          sessionStorage.removeItem('ttmp_email')
          window.location.href = '/login/'
          return
        }

        const data = await res.json()
        const sessionData = data.session || data

        const accountId = sessionData.account_id || ''
        const userEmail  = sessionData.email || email || ''
        const bal        = sessionData.transcript_tokens ?? sessionData.balance ?? 0

        setSession({
          email:   userEmail,
          tokenId: accountId,
          balance: bal,
        })
        setBalance(bal)
      } catch {
        sessionStorage.removeItem('ttmp_session_id')
        sessionStorage.removeItem('ttmp_email')
        window.location.href = '/login/'
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleRefreshBalance = async () => {
    if (!session?.tokenId) return
    try {
      const sessionId = sessionStorage.getItem('ttmp_session_id')
      const tokenRes = await fetch(
        `${WORKER_BASE}/v1/tokens/balance/${session.tokenId}`,
        {
          headers: {
            ...(sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {}),
          },
          credentials: 'include',
        }
      )
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        const bal = tokenData.transcript_tokens ?? tokenData.balance ?? 0
        setBalance(bal)
        setSession(prev => prev ? { ...prev, balance: bal } : prev)
      }
    } catch {
      // silently fail
    }
  }

  const handleOpenPurchaseModal = async () => {
    setPurchaseModalOpen(true)
    setModalError('')
    setPricingPackages([])
    try {
      const data = await getTokenPricing()
      setPricingPackages(data.packages)
    } catch {
      setModalError('Failed to load pricing. Please try again.')
    }
  }

  const handlePurchase = async (price_id: string) => {
    setPurchaseLoading(price_id)
    setModalError('')
    try {
      const data = await purchaseTokens(price_id)
      window.location.href = data.session_url
    } catch {
      setModalError('Purchase failed. Please try again.')
      setPurchaseLoading(null)
    }
  }

  const handleSignOut = async () => {
    const sessionId = sessionStorage.getItem('ttmp_session_id')
    await fetch(`${WORKER_BASE}/v1/auth/logout`, {
      method: 'POST',
      headers: {
        ...(sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {}),
      },
      credentials: 'include',
    })
    sessionStorage.removeItem('ttmp_session_id')
    sessionStorage.removeItem('ttmp_email')
    window.location.href = '/login/'
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setLogoDataUrl(result)
      setLogoFileName(file.name)
      localStorage.setItem('tm_brand_logo', result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoDataUrl(null)
    setLogoFileName('')
    localStorage.removeItem('tm_brand_logo')
  }

  const handlePdfFile = (file: File) => {
    setPdfFileName(file.name)
    setPdfReady(true)
    pdfFileRef.current = file
  }

  const handleExtractRaw = useCallback(async (): Promise<string | undefined> => {
    if (!pdfFileRef.current || !pdfjsRef.current) return
    const arrayBuffer = await pdfFileRef.current.arrayBuffer()
    const pdf = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    const trimmed = fullText.trim()
    setRawText(trimmed)
    return trimmed
  }, [])

  const handleParseStructured = async () => {
    let text = rawText
    if (!text) {
      const extracted = await handleExtractRaw()
      if (!extracted) return
      text = extracted
    }

    const transactions: { code: string; date: string; description: string; amount: string; impact: string }[] = []

    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Pattern 1: code date description amount
      // e.g. "150  01-15-2024  Tax return filed  $1,234.56"
      const p1 = trimmed.match(/^(\d{2,4})\s+(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
      if (p1) {
        transactions.push({
          code: p1[1],
          date: p1[2],
          description: p1[3].trim(),
          amount: p1[4],
          impact: p1[3].trim(),
        })
        continue
      }

      // Pattern 2: code date amount (no description)
      const p2 = trimmed.match(/^(\d{2,4})\s+(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
      if (p2) {
        transactions.push({
          code: p2[1],
          date: p2[2],
          description: getCodeDescription(p2[1]),
          amount: p2[3],
          impact: getCodeDescription(p2[1]),
        })
        continue
      }

      // Pattern 3: code spaces date (amount at end or zero)
      const p3 = trimmed.match(/^(\d{2,4})\s{2,}(\d{2}-\d{2}-\d{4})\s{2,}(.+)$/)
      if (p3) {
        const rest = p3[3].trim()
        const amtMatch = rest.match(/([\$\-]?[\d,]+\.\d{2})\s*$/)
        const amount = amtMatch ? amtMatch[1] : '$0.00'
        const desc = amtMatch ? rest.replace(amtMatch[0], '').trim() : rest
        transactions.push({
          code: p3[1],
          date: p3[2],
          description: desc || getCodeDescription(p3[1]),
          amount,
          impact: desc || getCodeDescription(p3[1]),
        })
      }
    }

    // Extract metadata
    const taxYearMatch = text.match(/TAX\s+PERIOD[:\s]+(\d{4})/i) || text.match(/\b(20\d{2})\b/)
    const taxYear = taxYearMatch ? taxYearMatch[1] : ''
    const balanceMatch = text.match(/ACCOUNT\s+BALANCE[:\s]+([\$\-]?[\d,.]+)/i)
    const balanceAmount = balanceMatch ? balanceMatch[1] : ''
    const returnTypeMatch = text.match(/RETURN\s+TYPE[:\s]+([A-Z0-9\-]+)/i)
    const returnType = returnTypeMatch ? returnTypeMatch[1] : ''

    const parsed = {
      taxpayer: { name: '', ssn: '', address: '', taxYear },
      filingInfo: { returnType, filingStatus: '', cyclePosted: '' },
      transactions,
      balances: {
        assessedTax: '',
        payments: '',
        credits: '',
        balance: balanceAmount,
      },
      metadata: {
        transcriptType: '',
        requestDate: '',
        parsedAt: new Date().toISOString(),
      },
    }

    setJsonText(JSON.stringify(parsed, null, 2))
  }

  const handleSavePreview = async () => {
    if (!session || !jsonText) return
    setPreviewStatus('Saving report...')

    const sessionId = sessionStorage.getItem('ttmp_session_id')
    const eventId = crypto.randomUUID()

    const res = await fetch(`${WORKER_BASE}/v1/transcripts/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({
        event_id: eventId,
        report_data: JSON.parse(jsonText),
      }),
    })

    const data = await res.json()

    if (res.ok && data.ok) {
      setReportEventId(data.event_id)
      setReportUrl(data.report_url)
      setPreviewSaved(true)
      setBalance(data.balance_after ?? 0)
      setSession(prev => prev ? { ...prev, balance: data.balance_after ?? 0 } : prev)
      setPreviewStatus(`Report saved. 1 token used. ${data.balance_after} tokens remaining.`)
      setTimeout(() => {
        window.location.href = `/app/report/?report_id=${data.report_id}`
      }, 1500)
    } else {
      setPreviewStatus(data.message || data.error || 'Failed to save report.')
    }
  }

  const handleEmailReport = async () => {
    if (!session || !reportEventId || !reportUrl || !emailInput) return
    setEmailStatus('Sending...')
    const sessionId = sessionStorage.getItem('ttmp_session_id')
    const res = await fetch(`${WORKER_BASE}/forms/transcript/report-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ email: emailInput, eventId: reportEventId, reportUrl, tokenId: session.tokenId }),
    })
    const data = await res.json()
    if (res.ok) {
      setEmailStatus('Report link sent to ' + emailInput)
    } else {
      setEmailStatus(data.error || 'Failed to send.')
    }
  }

  const handleCopy = (text: string, which: 'raw' | 'json') => {
    navigator.clipboard.writeText(text)
    if (which === 'raw') {
      setCopyRawLabel('Copied!')
      setTimeout(() => setCopyRawLabel('Copy'), 2000)
    } else {
      setCopyJsonLabel('Copied!')
      setTimeout(() => setCopyJsonLabel('Copy'), 2000)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') handlePdfFile(file)
  }

  if (loading) {
    return <div className={styles.loadingState}>Loading dashboard...</div>
  }

  return (
    <div className={styles.appShell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandMark}>TM</span>
          <div>
            <div className={styles.brandName}>Transcript.Tax Monitor Pro</div>
            <div className={styles.brandSub}>Dashboard</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/app/dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}><span className={styles.navDot} />Dashboard</Link>
          <Link href="/app/account" className={styles.navLink}><span className={styles.navDot} />Account</Link>
          <Link href="/app/reports" className={styles.navLink}><span className={styles.navDot} />Reports</Link>
          <Link href="/app/receipts" className={styles.navLink}><span className={styles.navDot} />Receipts</Link>
          <Link href="/app/support" className={styles.navLink}><span className={styles.navDot} />Support</Link>
          <Link href="/app/token-usage" className={styles.navLink}><span className={styles.navDot} />Token Usage</Link>
          <Link href="/app/calendar" className={styles.navLink}><span className={styles.navDot} />Calendar</Link>
          <Link href="/app/affiliate" className={styles.navLink}><span className={styles.navDot} />Affiliate</Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" onClick={handleSignOut} className={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main shell */}
      <div className={styles.mainShell}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.topbarTitle}>Dashboard</span>
            {session && <span className={styles.topbarEmail}>{session.email}</span>}
          </div>
          <div className={styles.topbarRight}>
            <span className={`${styles.tokenBadge} ${balance > 0 ? styles.tokenBadgeGreen : styles.tokenBadgeAmber}`}>
              {balance > 0 ? `${balance} tokens` : '0 tokens'}
            </span>
            <button type="button" onClick={handleRefreshBalance} className={styles.btnSecondary}>
              Refresh
            </button>
            <button type="button" onClick={handleOpenPurchaseModal} className={styles.btnPrimary}>
              Buy Tokens
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className={styles.workspaceContent}>
          <div className={styles.parserCard}>

              {/* Step tabs */}
              <div className={styles.parserSteps}>
                {([1, 2, 3] as Step[]).map((s) => {
                  const labels: Record<Step, { title: string; copy: string }> = {
                    1: { title: 'Check App Balance', copy: 'Check your available credits' },
                    2: { title: 'Upload Transcript PDF', copy: 'Choose your transcript' },
                    3: { title: 'Outputs', copy: 'Preview and email' },
                  }
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.parserStep} ${step === s ? styles.parserStepActive : ''} ${step > s ? styles.parserStepDone : ''}`}
                      onClick={() => setStep(s)}
                    >
                      <span className={styles.parserStepBadge}>{step > s ? '✓' : s}</span>
                      <div>
                        <div className={styles.parserStepTitle}>{labels[s].title}</div>
                        <p className={styles.parserStepCopy}>{labels[s].copy}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Panel 1 */}
              {step === 1 && (
                <div className={styles.parserSection}>
                  <div className={styles.panelGrid}>
                    <div>
                      <label className={styles.parserFormLabel}>Signed-in Account</label>
                      <input
                        type="text"
                        value={session?.email ?? ''}
                        className={styles.parserInput}
                        disabled
                        readOnly
                      />
                      <p className={styles.parserNote}>Saving a preview consumes 1 credit from your balance.</p>
                    </div>

                    <div>
                      <label className={styles.parserFormLabel}>Token Balance</label>
                      <div className={styles.tokenWidgetRow}>
                        <span className={`${styles.tokenBadge} ${balance > 0 ? styles.tokenBadgeGreen : styles.tokenBadgeAmber}`}>
                          {balance > 0 ? `${balance} tokens remaining` : '0 tokens — purchase to continue'}
                        </span>
                        <button type="button" onClick={handleRefreshBalance} className={styles.btnSecondary}>
                          Refresh
                        </button>
                        <button type="button" onClick={handleOpenPurchaseModal} className={styles.btnPrimary}>
                          Buy Tokens
                        </button>
                      </div>
                      {balance === 0 && (
                        <p className={styles.noTokensMsg}>No tokens remaining. Purchase tokens to analyze transcripts.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Panel 2 */}
              {step === 2 && (
                <div className={styles.parserSection}>
                  <div className={styles.logoSection}>
                    <label className={styles.parserFormLabel}>Firm Logo (Optional)</label>
                    <div className={styles.logoActions}>
                      <label className={styles.btnSecondary} style={{ cursor: 'pointer' }}>
                        <span>Choose File</span>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className={styles.hiddenInput}
                          onChange={handleLogoChange}
                        />
                      </label>
                      {logoDataUrl && (
                        <button type="button" onClick={handleRemoveLogo} className={styles.btnDanger}>
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <span className={styles.parserNote} style={{ display: 'inline-block', marginTop: 10 }}>
                      {logoFileName || 'No file chosen'}
                    </span>

                    {logoDataUrl && (
                      <div className={styles.logoPreview}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoDataUrl} alt="Saved firm logo preview" className={styles.logoPreviewImage} />
                        <div>
                          <div className={styles.logoPreviewName}>Saved logo</div>
                          <p className={styles.parserNote}>
                            This logo will stay available on this device until you remove it.
                          </p>
                        </div>
                      </div>
                    )}

                    <p className={styles.parserNote}>
                      For best results upload a 600×600 PNG (SVG/JPG ok). Your logo can stay saved on this device until you remove it.
                    </p>
                  </div>

                  <div
                    className={`${styles.parserUploadZone} ${dragging ? styles.parserUploadZoneDragging : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload transcript PDF"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className={styles.uploadZoneIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <polyline points="9 15 12 12 15 15"/>
                      </svg>
                    </div>
                    <div className={styles.uploadZoneTitle}>Drop IRS transcript PDF here</div>
                    <div className={styles.uploadZoneSub}>Or click to browse — Account, Return, Wage &amp; Income transcripts accepted</div>
                    {pdfFileName && <span className={styles.uploadZoneFile}>{pdfFileName}</span>}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className={styles.hiddenInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePdfFile(file)
                    }}
                  />
                </div>
              )}

              {/* Panel 3 — placeholder for step nav */}
              {step === 3 && (
                <div className={styles.parserSection}>
                  <p className={styles.parserNote}>Use the output panel below to extract, parse, and email reports.</p>
                </div>
              )}
          </div>

          {/* Always-visible output panel */}
          <div className={styles.outputCard} style={{ marginTop: 12 }}>
            <p className={styles.outputCardTitle}>Output</p>
            <div className={styles.parserActionRow}>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={!pdfReady}
                onClick={handleExtractRaw}
              >
                Extract raw text
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={!rawText}
                onClick={handleParseStructured}
              >
                Parse structured JSON
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={!jsonText || previewSaved || balance === 0}
                onClick={handleSavePreview}
              >
                Save report (1 token)
              </button>
            </div>

            {balance === 0 && (
              <p className={styles.noTokensMsg}>No tokens — purchase tokens to save reports.</p>
            )}

            <div className={styles.parserStatusBox}>{previewStatus}</div>

            <div className={styles.parserOutputGrid}>
              <div className={styles.parserOutputBox}>
                <div className={styles.parserOutputHead}>
                  <span className={styles.parserOutputTitle}>Raw text</span>
                  <button type="button" className={styles.parserCopyBtn} onClick={() => handleCopy(rawText, 'raw')}>{copyRawLabel}</button>
                </div>
                <pre className={styles.parserOutputPre}>{rawText || '— awaiting extraction —'}</pre>
              </div>
              <div className={styles.parserOutputBox}>
                <div className={styles.parserOutputHead}>
                  <span className={styles.parserOutputTitle}>Structured JSON</span>
                  <button type="button" className={styles.parserCopyBtn} onClick={() => handleCopy(jsonText, 'json')}>{copyJsonLabel}</button>
                </div>
                <pre className={styles.parserOutputPre}>{jsonText || '— awaiting parse —'}</pre>
              </div>
            </div>

            <div className={styles.emailSection}>
              <span className={styles.sectionLabel}>Email report link to client</span>
              <div className={styles.emailRow}>
                <input
                  id="report-email"
                  type="email"
                  placeholder="client@firm.com"
                  className={styles.parserInput}
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={!previewSaved || !emailInput}
                  onClick={handleEmailReport}
                >
                  Send link
                </button>
              </div>
              {emailStatus !== 'Not ready.' && (
                <p className={styles.parserNote} style={{ marginTop: 6 }}>{emailStatus}</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Token Purchase Modal */}
      {purchaseModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPurchaseModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Purchase Tokens</div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPurchaseModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {pricingPackages.length === 0 && !modalError && (
              <p className={styles.parserNote}>Loading packages...</p>
            )}

            {modalError && <p className={styles.modalError}>{modalError}</p>}

            {pricingPackages.length > 0 && (
              <div className={styles.packageGrid}>
                {pricingPackages.map((pkg) => (
                  <div
                    key={pkg.price_id}
                    className={`${styles.packageCard} ${pkg.badge === 'Popular' ? styles.packageCardPopular : ''}`}
                  >
                    {pkg.badge && (
                      <div className={styles.packagePopularBadge}>{pkg.badge}</div>
                    )}
                    <div className={styles.packageLabel}>{pkg.label}</div>
                    <div className={styles.packageTokens}>{pkg.tokens}</div>
                    <div className={styles.packageTokensLabel}>tokens</div>
                    <div className={styles.packagePrice}>${pkg.price}</div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      style={{ width: '100%' }}
                      disabled={purchaseLoading === pkg.price_id}
                      onClick={() => handlePurchase(pkg.price_id)}
                    >
                      {purchaseLoading === pkg.price_id ? 'Redirecting...' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
