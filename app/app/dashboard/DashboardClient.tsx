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

    // ── Detect transcript type ──
    const isReturnTranscript  = /Form 1040 Tax Return Transcript/i.test(text)
    const isRecordOfAccount   = /Form 1040 Record of Account/i.test(text)
    const isWageAndIncome     = /Wage and Income Transcript/i.test(text)
    const isAccountTranscript = !isReturnTranscript && !isRecordOfAccount && !isWageAndIncome

    // ── Universal metadata ──
    const ssnMatch       = text.match(/SSN[^:]*:\s*(XXX-XX-\d{4}|\d{3}-\d{2}-\d{4})/i)
    const nameMatch      = text.match(/(?:JAMI|JAMES|JOHN|JANE|[A-Z]{2,}\s+[A-Z]?\s*[A-Z]{2,})\s+\d{4}/)?.[0]
      || text.match(/(?:taxpayer name|name)[:\s]+([A-Z][A-Z\s]+)/i)?.[1]
    const taxPeriodMatch = text.match(/Tax Period(?:\s+Ending|\s+Requested)?[:\s]+(?:\d{2}-\d{2}-)?(\d{4})/i)
      || text.match(/Report\s+for\s+Tax\s+Period\s+Ending[:\s]+\d{2}-\d{2}-(\d{4})/i)
    const taxYear = taxPeriodMatch?.[1] || ''
    const requestDateMatch = text.match(/Request Date[:\s]+(\d{2}-\d{2}-\d{4})/i)
    const requestDate    = requestDateMatch?.[1] || ''
    const cycleMatch     = text.match(/Cycle posted[:\s]+(\d+)/i)
    const receivedMatch  = text.match(/Received date[:\s]+(\d{2}-\d{2}-\d{4})/i)
    const filingStatusMatch = text.match(/Filing status[:\s]+(\w+)/i)
    const formMatch      = text.match(/Taxpayer Form number[:\s]+([\w-]+)/i)
    const trackingMatch  = text.match(/Tracking Number[:\s]+(\d+)/i)

    function extractAmt(label: string): string {
      const re = new RegExp(label + '[:\\s]+\\$?([\\d,\\.]+)', 'i')
      const m  = text.match(re)
      return m ? '$' + m[1] : '$0.00'
    }

    function extractVal(label: string, src?: string): string {
      const re = new RegExp(label + '[:\\s]+([^\\n\\r$]+)', 'i')
      const m  = (src || text).match(re)
      return m ? m[1].trim() : '—'
    }

    function extractAmtFrom(label: string, src: string): string {
      const re = new RegExp(label + '[:\\s]+\\$?([\\d,\\.]+)', 'i')
      const m  = src.match(re)
      return m ? '$' + m[1] : '$0.00'
    }

    if (isReturnTranscript) {
      // ── RETURN TRANSCRIPT parsing ──
      const parsed = {
        transcriptType: 'return',
        taxpayer: {
          ssn:          ssnMatch?.[1] || '—',
          name:         nameMatch?.replace(/\d{4}.*/, '').trim() || '—',
          taxYear,
          requestDate,
          filingStatus: filingStatusMatch?.[1] || '—',
          formNumber:   formMatch?.[1] || '1040',
          cyclePosted:  cycleMatch?.[1] || '—',
          receivedDate: receivedMatch?.[1] || '—',
          trackingNumber: trackingMatch?.[1] || '—',
        },
        income: {
          totalWages:            extractAmt('Total wages'),
          businessIncome:        extractAmt('Business income or loss \\(Schedule C\\):'),
          totalIncome:           extractAmt('Total income:'),
          adjustedGrossIncome:   extractAmt('Adjusted gross income:'),
          scheduleEIC_SelfEmploymentIncome: extractAmt('Schedule EIC Self-employment income per computer'),
        },
        adjustments: {
          selfEmploymentTaxDeduction: extractAmt('Self-employment tax deduction:'),
          qualifiedBusinessIncome:    extractAmt('Qualified business income deduction:'),
          totalAdjustments:           extractAmt('Total adjustments:'),
        },
        taxAndCredits: {
          taxableIncome:        extractAmt('Taxable income:'),
          tentativeTax:         extractAmt('Tentative tax:'),
          selfEmploymentTax:    extractAmt('Self employment tax:'),
          totalTaxLiability:    extractAmt('Total tax liability taxpayer figures:'),
          incomeTaxAfterCredits: extractAmt('Income tax after credits per computer'),
          standardDeduction:    extractAmt('Standard deduction per computer'),
          totalCredits:         extractAmt('Total credits:'),
        },
        payments: {
          federalWithheld:   extractAmt('Federal income tax withheld:'),
          estimatedPayments: extractAmt('Estimated tax payments:'),
          totalPayments:     extractAmt('Total payments:'),
        },
        refundOrOwed: {
          amountOwed:        extractAmt('Amount you owe:'),
          balanceDue:        extractAmt('Balance due\\/overpayment using taxpayer figure per computer'),
          estimatedPenalty:  extractAmt('Estimated tax penalty:'),
        },
        scheduleC: {
          grossReceipts:     extractAmt('Gross receipts or sales:'),
          totalExpenses:     extractAmt('Total expenses:'),
          homeOfficeExpense: extractAmt('Expense for business use of home:'),
          netProfit:         extractAmt('Schedule C net profit or loss per computer'),
          naicsCode:         extractVal('North American Industry Classification System'),
          accountMethod:     extractVal('Account method'),
        },
        selfEmploymentTax: {
          totalSETax:        extractAmt('Total Self-Employment tax per computer'),
          seIncome:          extractAmt('Total Self-Employment income:'),
          socialSecurityTax: extractAmt('Self-Employment Social Security tax computer'),
          medicareTax:       extractAmt('Self-Employment Medicare tax per computer'),
        },
        qualifiedBusinessIncome: {
          qbiComponent:      extractAmt('Qualified business income component:'),
          totalQBI:          extractAmt('Total qualified business income or loss:'),
          deduction:         extractAmt('Form 8995 net capital gains'),
        },
        transactions: [],
        balances: {
          assessedTax: extractAmt('Total assessment per computer'),
          payments:    extractAmt('Total payments:'),
          credits:     extractAmt('Total credits:'),
          balance:     extractAmt('Amount you owe:'),
        },
        metadata: {
          transcriptType: 'Form 1040 Tax Return Transcript',
          requestDate,
          parsedAt: new Date().toISOString(),
        },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // ── WAGE & INCOME TRANSCRIPT parsing ──
    if (isWageAndIncome) {
      const w2Forms: any[] = []
      const w2Sections = text.split(/Form W-2 Wage and Tax Statement/gi).slice(1)
      for (const section of w2Sections) {
        const emp = section.match(/Employer[:\s]*\n[^\n]*\n[^\n]*\n([A-Z][A-Z\s&]+)/)?.[1]?.trim()
        const ein = section.match(/Employer Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{7})/i)?.[1]
        w2Forms.push({
          employer:   emp || extractVal('Employer', section) || '—',
          ein:        ein || '—',
          wages:      extractAmtFrom('Wages, Tips and Other Compensation', section),
          fedWithheld:extractAmtFrom('Federal Income Tax Withheld', section),
          ssWages:    extractAmtFrom('Social Security Wages', section),
          ssTax:      extractAmtFrom('Social Security Tax Withheld', section),
          medicareWages: extractAmtFrom('Medicare Wages and Tips', section),
          medicareTax:   extractAmtFrom('Medicare Tax Withheld', section),
          submissionType: section.match(/Submission Type:\s*([^\n]+)/i)?.[1]?.trim() || '—',
        })
      }

      const b1099Forms: any[] = []
      const b1099Sections = text.split(/Form 1099-B/gi).slice(1)
      for (const section of b1099Sections) {
        const proceeds  = extractAmtFrom('Proceeds', section)
        const costBasis = extractAmtFrom('Cost or Basis', section)
        const proceedsNum = parseFloat(proceeds.replace(/[^0-9.-]/g, '')) || 0
        const costNum     = parseFloat(costBasis.replace(/[^0-9.-]/g, '')) || 0
        const gainLoss    = (proceedsNum - costNum).toFixed(2)
        b1099Forms.push({
          payer:          section.match(/(?:XX-XXX\d+)\s+([A-Z][A-Z\s&]+)/)?.[1]?.trim() || '—',
          fin:            section.match(/Payer's Federal Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{7})/i)?.[1] || '—',
          dateSold:       section.match(/Date Sold or Disposed:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '—',
          dateAcquired:   section.match(/Date acquired:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '—',
          proceeds,
          costBasis,
          gainLoss:       gainLoss.startsWith('-') ? `-$${gainLoss.slice(1)}` : `$${gainLoss}`,
          description:    section.match(/Description:\s*([^\n]+)/i)?.[1]?.trim() || '—',
          gainType:       section.match(/Type of gain or loss:\s*([^\n]+)/i)?.[1]?.trim() || '—',
          accountNumber:  section.match(/Account Number:\s*([^\n]+)/i)?.[1]?.trim() || '—',
        })
      }

      const totalWages   = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.wages.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalFedWH   = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.fedWithheld.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalProceeds = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.proceeds.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalBasis    = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.costBasis.replace(/[^0-9.]/g, '') || '0'), 0)

      const parsed = {
        transcriptType: 'wage-income',
        taxpayer: {
          ssn:           ssnMatch?.[1] || '—',
          taxYear,
          requestDate,
          trackingNumber: trackingMatch?.[1] || '—',
        },
        w2Forms,
        b1099Forms,
        summary: {
          totalW2s:        w2Forms.length,
          total1099Bs:     b1099Forms.length,
          totalWages:      `$${totalWages.toFixed(2)}`,
          totalFedWithheld:`$${totalFedWH.toFixed(2)}`,
          totalProceeds:   `$${totalProceeds.toFixed(2)}`,
          totalBasis:      `$${totalBasis.toFixed(2)}`,
          totalGainLoss:   `$${(totalProceeds - totalBasis).toFixed(2)}`,
        },
        transactions: [],
        balances: { assessedTax: '', payments: '', credits: '', balance: '' },
        metadata: { transcriptType: 'Wage and Income Transcript', requestDate, parsedAt: new Date().toISOString() },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // ── RECORD OF ACCOUNT parsing ──
    if (isRecordOfAccount) {
      const transactions: any[] = []
      const txSection = text.match(/TRANSACTIONS[\s\S]*?(?=SSN provided:|$)/i)?.[0] || ''
      const txLines   = txSection.split('\n')
      for (const line of txLines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        const p = trimmed.match(/^(\d{3})\s+(.+?)\s+(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
        if (p) {
          transactions.push({ code: p[1], date: p[3], description: p[2].trim(), amount: p[4], impact: p[2].trim() })
          continue
        }
        const p2 = trimmed.match(/^(\d{3})\s+(.+?)\s+\d{11,}\s+\d{8}\s+(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
        if (p2) {
          transactions.push({ code: p2[1], date: p2[3], description: p2[2].trim(), amount: p2[4], impact: p2[2].trim() })
          continue
        }
        const p3 = trimmed.match(/^(\d{3})\s{2,}([A-Za-z].+?)\s{2,}(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})/)
        if (p3) {
          transactions.push({ code: p3[1], date: p3[3], description: p3[2].trim(), amount: p3[4], impact: p3[2].trim() })
        }
      }

      const acctBalance    = text.match(/Account balance:\s*\$([\d,\.]+)/i)?.[1]
      const accruedInt     = text.match(/Accrued interest:\s*\$([\d,\.]+)/i)?.[1]
      const accruedPenalty = text.match(/Accrued penalty:\s*\$([\d,\.]+)/i)?.[1]
      const payoffAmt      = text.match(/Account balance plus accruals[^:]*:\s*\$([\d,\.]+)/i)?.[1]

      const parsed = {
        transcriptType: 'record-of-account',
        taxpayer: {
          ssn:           ssnMatch?.[1] || '—',
          taxYear,
          requestDate,
          filingStatus:  filingStatusMatch?.[1] || '—',
          formNumber:    formMatch?.[1] || '1040',
          cyclePosted:   cycleMatch?.[1] || '—',
          receivedDate:  receivedMatch?.[1] || '—',
          trackingNumber: trackingMatch?.[1] || '—',
        },
        accountBalance: {
          balance:      acctBalance ? `$${acctBalance}` : '$0.00',
          accruedInt:   accruedInt  ? `$${accruedInt}`  : '$0.00',
          accruedPenalty: accruedPenalty ? `$${accruedPenalty}` : '$0.00',
          payoffAmount: payoffAmt   ? `$${payoffAmt}`   : '$0.00',
        },
        transactions,
        income: {
          totalWages:          extractAmt('Total wages'),
          businessIncome:      extractAmt('Business income or loss \\(Schedule C\\):'),
          totalIncome:         extractAmt('Total income:'),
          adjustedGrossIncome: extractAmt('Adjusted gross income:'),
        },
        taxAndCredits: {
          taxableIncome:     extractAmt('Taxable income:'),
          tentativeTax:      extractAmt('Tentative tax:'),
          selfEmploymentTax: extractAmt('Self employment tax:'),
          totalTaxLiability: extractAmt('Total tax liability taxpayer figures:'),
          totalCredits:      extractAmt('Total credits:'),
          standardDeduction: extractAmt('Standard deduction per computer'),
        },
        payments: {
          federalWithheld:   extractAmt('Federal income tax withheld:'),
          estimatedPayments: extractAmt('Estimated tax payments:'),
          totalPayments:     extractAmt('Total payments:'),
        },
        refundOrOwed: {
          amountOwed: extractAmt('Amount you owe:'),
          balanceDue: extractAmt('Balance due\\/overpayment using taxpayer figure per computer'),
        },
        scheduleC: {
          grossReceipts:     extractAmt('Gross receipts or sales:'),
          totalExpenses:     extractAmt('Total expenses:'),
          homeOfficeExpense: extractAmt('Expense for business use of home:'),
          netProfit:         extractAmt('Schedule C net profit or loss per computer'),
          naicsCode:         extractVal('North American Industry Classification System'),
        },
        selfEmploymentTax: {
          totalSETax:        extractAmt('Total Self-Employment tax per computer'),
          seIncome:          extractAmt('Total Self-Employment income:'),
          socialSecurityTax: extractAmt('Self-Employment Social Security tax computer'),
          medicareTax:       extractAmt('Self-Employment Medicare tax per computer'),
        },
        balances: {
          assessedTax: extractAmt('Total assessment per computer'),
          payments:    extractAmt('Total payments:'),
          credits:     extractAmt('Total credits:'),
          balance:     acctBalance ? `$${acctBalance}` : '$0.00',
        },
        metadata: {
          transcriptType: 'Form 1040 Record of Account',
          requestDate,
          parsedAt: new Date().toISOString(),
        },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // ── ACCOUNT TRANSCRIPT parsing (transaction codes) ──
    const transactions: any[] = []
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Must start with a 3-digit transaction code
      if (!/^\d{3}\s/.test(trimmed)) continue

      // Extract the date — always MM-DD-YYYY format
      const dateMatch = trimmed.match(/(\d{2}-\d{2}-\d{4})\s+([\-]?\$[\d,]+\.\d{2})\s*$/)
      if (!dateMatch) continue

      const date   = dateMatch[1]
      const amount = dateMatch[2]
      const code   = trimmed.slice(0, 3)

      // Everything between code and date is description + optional cycle data
      let middle = trimmed.slice(3, trimmed.lastIndexOf(dateMatch[0])).trim()

      // Remove cycle numbers (8-digit numbers like 20221605)
      middle = middle.replace(/\b\d{8}\b/g, '').trim()

      // Remove IRS document reference numbers like 90211-509-61036-2
      middle = middle.replace(/\b\d{5}-\d{3}-\d{5}-\d{1,2}\b/g, '').trim()

      // Remove notice codes like NOTICE1444, CP   0014
      middle = middle.replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '').trim()

      // Collapse multiple spaces
      const description = middle.replace(/\s{2,}/g, ' ').trim() || getCodeDescription(code)

      transactions.push({
        code,
        date,
        amount,
        description,
        impact: description,
      })
    }

    const balanceMatch       = text.match(/Account\s+balance[:\s]+\$?([\d,\.]+)/i)
    const acctBalanceMatch   = text.match(/Account\s+balance:\s*\$([\d,\.]+)/i)
    const accruedIntMatch    = text.match(/Accrued\s+interest:\s*\$([\d,\.]+)/i)
    const accruedPenMatch    = text.match(/Accrued\s+penalty:\s*\$([\d,\.]+)/i)
    const payoffMatch        = text.match(/Account\s+balance\s+plus\s+accruals[^:]*:\s*\$([\d,\.]+)/i)
    const returnTypeMatch    = text.match(/RETURN\s+TYPE[:\s]+([A-Z0-9\-]+)/i)

    const filingStatusMatch2 = text.match(/Filing\s+status[:\s]+(\w+)/i)
    const agiMatch           = text.match(/Adjusted\s+gross\s+income[:\s]+\$([\d,\.]+)/i)
    const taxableIncMatch    = text.match(/Taxable\s+income[:\s]+\$([\d,\.]+)/i)
    const taxPerReturnMatch  = text.match(/Tax\s+per\s+return[:\s]+\$([\d,\.]+)/i)
    const procDateMatch      = text.match(/Processing\s+date[:\s]+(\d{2}-\d{2}-\d{4})/i)
    const returnDueMatch     = text.match(/Return\s+due\s+date[^:]*:\s*(\d{2}-\d{2}-\d{4})/i)

    const parsed = {
      transcriptType: 'account',
      taxpayer: { ssn: ssnMatch?.[1] || '—', name: '—', taxYear, requestDate, filingStatus: filingStatusMatch?.[1] || '—', formNumber: formMatch?.[1] || '—', cyclePosted: cycleMatch?.[1] || '—', receivedDate: receivedMatch?.[1] || '—', trackingNumber: trackingMatch?.[1] || '—' },
      transactions,
      balances: {
        assessedTax: '',
        payments:    '',
        credits:     '',
        balance:     acctBalanceMatch ? `$${acctBalanceMatch[1]}` : (balanceMatch?.[1] ? `$${balanceMatch[1]}` : '$0.00'),
        accruedInt:  accruedIntMatch  ? `$${accruedIntMatch[1]}`  : '$0.00',
        accruedPenalty: accruedPenMatch ? `$${accruedPenMatch[1]}` : '$0.00',
        payoffAmount: payoffMatch ? `$${payoffMatch[1]}` : '$0.00',
      },
      returnSummary: {
        filingStatus:        filingStatusMatch2?.[1] || '—',
        adjustedGrossIncome: agiMatch ? `$${agiMatch[1]}` : '—',
        taxableIncome:       taxableIncMatch ? `$${taxableIncMatch[1]}` : '—',
        taxPerReturn:        taxPerReturnMatch ? `$${taxPerReturnMatch[1]}` : '—',
        processingDate:      procDateMatch?.[1] || '—',
        returnDueDate:       returnDueMatch?.[1] || '—',
      },
      filingInfo: { returnType: returnTypeMatch?.[1] || '—', filingStatus: '', cyclePosted: '' },
      metadata: { transcriptType: 'Account Transcript', requestDate, parsedAt: new Date().toISOString() },
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
