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
        setSession({
          email: data.email || email || '',
          tokenId: data.account_id || data.user?.tokenId || '',
          balance: data.balance ?? data.user?.balance ?? 0,
        })
        setBalance(data.balance ?? data.user?.balance ?? 0)
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
    if (!session) return
    try {
      const data = await getTokenBalance(session.tokenId)
      setBalance(data.transcript_tokens)
      setSession(prev => prev ? { ...prev, balance: data.transcript_tokens } : prev)
    } catch {
      // silently fail, keep existing balance
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
    await fetch(`${WORKER_BASE}/v1/auth/logout`, { method: 'POST', credentials: 'include' })
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

    const transactions: { code: string; date: string; description: string; amount: string }[] = []
    const txPattern = /(\d{3})\s+(\d{2}-\d{2}-\d{4})\s+([^$\n]+?)\s+(\$[\d,]+\.\d{2})/g
    let match
    while ((match = txPattern.exec(text)) !== null) {
      transactions.push({ code: match[1], date: match[2], description: match[3].trim(), amount: match[4] })
    }

    const taxYearMatch = text.match(/TAX\s+PERIOD[:\s]+(\d{4})/i) || text.match(/\b(20\d{2})\b/)
    const taxYear = taxYearMatch ? taxYearMatch[1] : ''

    const balanceMatch = text.match(/ACCOUNT\s+BALANCE[:\s]+([\$\d,.]+)/i)
    const balanceAmount = balanceMatch ? balanceMatch[1] : ''

    const returnTypeMatch = text.match(/RETURN\s+TYPE[:\s]+([A-Z0-9-]+)/i)
    const returnType = returnTypeMatch ? returnTypeMatch[1] : ''

    const parsed = {
      taxpayer: { name: '', ssn: '', address: '', taxYear },
      filingInfo: { returnType, filingStatus: '', cyclePosted: '' },
      transactions,
      balances: { assessedTax: '', payments: '', credits: '', balance: balanceAmount },
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
    setPreviewStatus('Saving preview...')
    const res = await fetch(`${WORKER_BASE}/v1/transcripts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reportData: JSON.parse(jsonText) }),
    })
    const data = await res.json()
    if (res.ok) {
      setReportEventId(data.eventId)
      setReportUrl(data.reportUrl)
      setPreviewSaved(true)
      setBalance(data.balance)
      setPreviewStatus('Preview saved. 1 credit used.')
    } else {
      setPreviewStatus(data.error || 'Failed to save preview.')
    }
  }

  const handleEmailReport = async () => {
    if (!session || !reportEventId || !reportUrl || !emailInput) return
    setEmailStatus('Sending...')
    const res = await fetch(`${WORKER_BASE}/forms/transcript/report-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
