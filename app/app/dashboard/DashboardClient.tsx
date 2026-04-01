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
    // Entity codes
    '000': 'Establishment of tax module',
    '011': 'Entity created',
    '012': 'Entity updated',
    '013': 'Entity updated — name change',
    '014': 'Address change',
    '015': 'Address change — international',
    '016': 'Employer identification number (EIN) change',
    '017': 'Spouse SSN change',
    '018': 'Entity updated — SSN change',
    '020': 'Name change',
    '021': 'Name change — corporation',
    '022': 'Entity concealment',
    '030': 'Entity updated — filing requirement change',
    '036': 'Reactivate tax module',
    '037': 'Reactivate tax module — delinquent return',
    '050': 'Module blocked from automated collection',
    '051': 'Module unblocked from automated collection',
    '054': 'Amended return filed — TC 54',
    '060': 'Taxpayer has been identified for ACS',
    '062': 'Installment agreement established via ACS',
    '063': 'Installment agreement defaulted via ACS',
    '065': 'Balance due notice issued via ACS',
    '076': 'Duplicate return filed',
    '077': 'Amended return filed — TC 77',
    '080': 'Entity updated — bankruptcy',
    '081': 'Bankruptcy discharged',
    '082': 'Bankruptcy dismissed',
    '090': 'Penalty suspension — disaster relief',
    '091': 'Penalty suspension lifted',
    '098': 'Delete entity',
    // Filing and assessment
    '150': 'Tax return filed — tax liability established',
    '151': 'Tax return filed — tax liability reduced',
    '152': 'Tax return filed — no tax liability',
    '154': 'Supplemental assessment',
    '160': 'Failure-to-file (FTF) penalty assessed',
    '161': 'Failure-to-file penalty abated',
    '162': 'Failure-to-file penalty abated — tax court',
    '163': 'Failure-to-file penalty abated — disaster',
    '165': 'Penalty for failure to deposit',
    '166': 'Failure-to-pay (FTP) penalty assessed',
    '167': 'Failure-to-pay penalty abated',
    '168': 'Failure-to-pay penalty abated — tax court',
    '170': 'Estimated tax penalty assessed',
    '171': 'Estimated tax penalty abated',
    '172': 'Estimated tax penalty abated — tax court',
    '176': 'Penalty for failure to deposit — abated',
    '177': 'Penalty for failure to deposit — abated',
    '180': 'Deposit penalty — pre-assessed',
    '186': 'Deposit penalty assessed',
    '190': 'Accuracy-related penalty assessed',
    '191': 'Accuracy-related penalty abated',
    '192': 'Accuracy-related penalty abated — tax court',
    '196': 'Interest charged for late payment',
    '197': 'Interest abated',
    '198': 'Interest abated — tax court',
    '199': 'Interest assessed — restricted',
    // Additional assessments
    '240': 'Miscellaneous penalty assessed',
    '241': 'Miscellaneous penalty abated',
    '270': 'Failure-to-pay penalty assessed',
    '271': 'Failure-to-pay penalty abated',
    '272': 'Failure-to-pay penalty abated — tax court',
    '276': 'Failure-to-pay penalty assessed',
    '277': 'Failure-to-pay penalty abated',
    '280': 'Penalty for underpayment of corporate estimated tax',
    '281': 'Penalty for underpayment abated',
    '290': 'Additional tax assessed',
    '291': 'Tax decreased',
    '294': 'Additional tax assessed — math error',
    '295': 'Additional tax assessment reduced',
    '298': 'Tax increased — correction of error',
    '299': 'Tax decreased — correction of error',
    // Examination
    '300': 'Additional tax assessed — examination',
    '301': 'Tax decreased — examination',
    '304': 'Additional assessment — partial agreement',
    '305': 'Tax decrease — partial agreement',
    '308': 'Additional assessment — unallowable items',
    '309': 'Tax decrease — unallowable items',
    '310': 'Additional tax assessed — automated underreporter',
    '311': 'Tax decreased — automated underreporter',
    '320': 'Failure-to-file penalty assessed — examination',
    '321': 'Failure-to-file penalty abated — examination',
    '322': 'Failure-to-file penalty abated — tax court',
    '330': 'Additional tax — failure to file',
    '336': 'Failure-to-pay penalty — examination',
    '337': 'Failure-to-pay penalty abated — examination',
    '340': 'Estimated tax penalty — examination',
    '341': 'Estimated tax penalty abated — examination',
    '350': 'Failure to deposit penalty — examination',
    '360': 'Interest assessed — examination',
    '361': 'Interest abated — examination',
    '365': 'Delinquency penalty — Tax Court case',
    '366': 'Penalty waiver — Tax Court case',
    '370': 'Credit transferred from another module',
    '371': 'Credit transfer reversed',
    // Collections and credits
    '400': 'Earned income credit applied',
    '402': 'Earned income credit reversed',
    '403': 'Earned income credit applied — examination',
    '404': 'Earned income credit reversed — examination',
    '405': 'Amended return filed — tax assessed',
    '406': 'Amended return abated',
    '410': 'Investment credit applied',
    '411': 'Investment credit reversed',
    '420': 'Examination of tax return initiated',
    '421': 'Examination closed — no change',
    '422': 'Examination closed — no change',
    '424': 'Examination referral — return examined',
    '425': 'Examination referral reversed',
    '428': 'Examination initiated — field exam',
    '430': 'Estimated tax payment',
    '431': 'Estimated tax payment reversed',
    '432': 'Estimated tax payment applied',
    '440': 'Payment of deferred tax',
    '460': 'Extension of time to file granted',
    '461': 'Extension of time to file denied',
    '462': 'Extension of time to file — automatic',
    '470': 'Collection action suspended',
    '471': 'Collection action suspension released',
    '472': 'Collection action suspended — Tax Court',
    '480': 'Offer in compromise (OIC) pending',
    '481': 'Offer in compromise rejected',
    '482': 'Offer in compromise accepted',
    '483': 'Offer in compromise withdrawn',
    '484': 'Offer in compromise — revised amount',
    '485': 'Offer in compromise — default',
    '486': 'Offer in compromise — returned',
    '490': 'OIC — collection suspended',
    '491': 'OIC — collection suspension released',
    '494': 'Offer in compromise — collection suspension',
    '500': 'Installment agreement granted',
    '501': 'Installment agreement modified',
    '502': 'Installment agreement — Tax Court',
    '503': 'Installment agreement terminated',
    '504': 'Installment agreement — notice of default',
    '505': 'Installment agreement reinstated',
    '506': 'Installment agreement — payroll deduction',
    '520': 'Collection suspended — pending litigation',
    '521': 'Collection suspension released — litigation',
    '522': 'Collection suspended — innocent spouse',
    '523': 'Collection suspension released — innocent spouse',
    '524': 'Collection suspended — combat zone',
    '530': 'Currently not collectible (CNC) — hardship',
    '531': 'CNC status released',
    '532': 'CNC — unable to locate taxpayer',
    '533': 'CNC — unable to contact taxpayer',
    '534': 'CNC — unable to locate',
    '535': 'CNC — death of taxpayer',
    '536': 'CNC — no assets / income below threshold',
    '537': 'CNC — taxpayer out of country',
    '540': 'Military deferral',
    '541': 'Military deferral released',
    '550': 'Summons issued',
    '560': 'Jeopardy assessment',
    '570': 'Additional liability pending — refund hold',
    '571': 'Additional liability resolved — hold released',
    '572': 'Additional liability resolved — hold released',
    '580': 'Notice of levy filed',
    '581': 'Notice of levy released',
    '582': 'Federal tax lien (FTL) filed',
    '583': 'Federal tax lien released',
    '584': 'Federal tax lien — withdrawal',
    '585': 'Federal tax lien — subordination',
    '586': 'Federal tax lien — discharge',
    '590': 'Statute of limitations extended',
    '591': 'Statute extension released',
    '592': 'Statute of limitations — litigation hold',
    '593': 'Statute — litigation hold released',
    '599': 'Statute of limitations — extended by consent',
    '600': 'Penalty for underpayment of estimated tax',
    '601': 'Estimated tax penalty abated',
    '602': 'Estimated tax penalty abated — Tax Court',
    '605': 'Failure-to-pay penalty',
    '606': 'Failure-to-pay penalty abated',
    '607': 'Failure-to-pay penalty abated — Tax Court',
    '608': 'Statute of limitations expired — no liability',
    '610': 'Payment submitted with return',
    '611': 'Payment with return reversed',
    '620': 'Regular payment received',
    '621': 'Regular payment reversed',
    '630': 'Tax deposit received',
    '640': 'Tax deposit received — late',
    '650': 'Payment received',
    '651': 'Payment reversed',
    '660': 'Estimated tax payment received',
    '661': 'Estimated tax payment reversed',
    '670': 'Payment applied to balance due',
    '671': 'Payment reversed',
    '672': 'Designated payment applied',
    '676': 'Payment — credit elect',
    '680': 'Designated payment applied',
    '681': 'Designated payment reversed',
    '690': 'Penalty credit applied',
    '691': 'Penalty credit reversed',
    '694': 'Refund applied to next year\'s estimated tax',
    '695': 'Refund credit elect reversed',
    '700': 'Credit transferred to this module',
    '701': 'Credit transfer reversed',
    '706': 'Credit transferred from another year',
    '710': 'Excess collection credit applied',
    '711': 'Excess collection credit reversed',
    '716': 'Credit transferred out of this module',
    '717': 'Credit transfer reversed',
    '718': 'Credit transferred — court ordered',
    '720': 'Refundable credit applied',
    '721': 'Refundable credit reversed',
    '722': 'Earned income credit applied',
    '724': 'Earned income credit reversed',
    '730': 'Backup withholding credit applied',
    '731': 'Backup withholding reversed',
    '736': 'Interest on overpayment — credited',
    '740': 'Undelivered refund check returned',
    '741': 'Returned refund check cancelled',
    '742': 'Undelivered refund — reissued',
    '745': 'Identity theft — refund frozen',
    '760': 'Earned income credit applied — examination',
    '761': 'Earned income credit reversed — examination',
    '762': 'Earned income credit — disallowed',
    '763': 'Earned income credit — disallowed',
    '764': 'Earned income credit applied',
    '765': 'Earned income credit reversed',
    '766': 'Credit to your account (refundable credit)',
    '767': 'Credit reversed',
    '768': 'Earned income credit applied',
    '769': 'Earned income credit reversed',
    '770': 'Interest credited to account',
    '771': 'Interest reversed',
    '772': 'Interest on overpayment credited',
    '776': 'Interest assessed on balance due',
    '777': 'Interest reversed',
    '780': 'OIC — partial payment applied',
    '781': 'OIC — partial payment reversed',
    '790': 'Credit applied from OIC',
    '800': 'Withholding credit applied',
    '801': 'Withholding credit reversed',
    '806': 'Federal income tax withholding credit applied',
    '807': 'Withholding credit reversed',
    '808': 'Withholding credit — W-2 mismatch',
    '810': 'Refund freeze — refund held',
    '811': 'Refund freeze released',
    '812': 'Refund cancelled — re-issued',
    '820': 'Credit transferred to another account',
    '821': 'Credit transfer reversed',
    '824': 'Credit transferred — duplicate return',
    '826': 'Credit transferred — overpayment applied to balance due',
    '827': 'Credit transfer reversed',
    '828': 'Credit applied — backup withholding',
    '830': 'Overpayment credit waived',
    '832': 'Overpayment applied to another year',
    '836': 'Overpayment credit applied — prior year',
    '840': 'Manual refund issued',
    '841': 'Manual refund reversed',
    '842': 'Manual refund — non-receipt reissued',
    '843': 'Abatement of penalty or interest',
    '844': 'Penalty abatement — first time',
    '846': 'Refund issued',
    '847': 'Refund reversed',
    '848': 'Refund — supplemental',
    '850': 'Overpayment applied to non-tax debt (TOP)',
    '851': 'TOP offset reversed',
    '856': 'Overpayment applied — child support',
    '857': 'Child support offset reversed',
    '860': 'Overpayment applied — state income tax',
    '870': 'Waiver of restrictions on assessment',
    '880': 'Penalty waiver — reasonable cause',
    '881': 'Penalty waiver — statutory exception',
    '882': 'Penalty waiver — administrative waiver',
    '890': 'Penalty waiver granted',
    '898': 'Refund applied to non-tax debt (TOP offset)',
    '899': 'TOP offset reversal',
    '900': 'Penalty waiver — IRS error',
    '910': 'Penalty suspended — disaster',
    '911': 'Penalty suspension released',
    '916': 'Penalty suspended — innocent spouse',
    '917': 'Penalty suspension released — innocent spouse',
    '920': 'IRS error — account adjustment',
    '921': 'IRS error — account adjustment reversed',
    '922': 'IRS error — duplicate assessment',
    '930': 'Installment agreement payment received',
    '931': 'Installment agreement payment reversed',
    '960': 'Power of attorney (POA) on file',
    '961': 'Power of attorney revoked',
    '970': 'Additional tax return filed',
    '971': 'Notice issued to taxpayer',
    '972': 'Notice rescinded',
    '976': 'Duplicate return filed — unpostable',
    '977': 'Amended return filed — TC 977',
    '978': 'Amended return filed — unpostable',
    '979': 'Amended return accepted',
    '983': 'Refund held — identity theft',
    '984': 'Identity theft hold released',
    '985': 'Erroneous refund — assessment',
    '986': 'Erroneous refund — abatement',
    '988': 'Duplicate return filed — assessment',
    '990': 'Statute extended — consent',
    '991': 'Statute extension — litigation',
    '992': 'Statute extension — bankruptcy',
    '993': 'Statute extension — foreign tax credit',
    '994': 'Statute extension — foreign corporation',
    '995': 'Statute extension — innocent spouse',
    '996': 'Statute extension — combat zone',
    '997': 'Statute extension — financial disability',
    '998': 'Statute extension — collection',
    '999': 'Statute extension — other',
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

    // ── Normalise text — collapse multiple spaces to single space ──
    const norm = text.replace(/\s{2,}/g, ' ')

    // ── Whitespace-tolerant extraction helpers ──
    function amt(label: string): string {
      const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
      const re = new RegExp(pattern + '\\s*:\\s*\\$?([\\d,]+\\.\\d{2})', 'i')
      const m  = norm.match(re)
      return m ? '$' + m[1] : '$0.00'
    }

    function val(label: string): string {
      const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
      const re = new RegExp(pattern + '\\s*:\\s*([^\\n\\r$\\d][^\\n\\r]*)', 'i')
      const m  = norm.match(re)
      return m ? m[1].trim().split(/\s{2,}/)[0].trim() : '—'
    }

    function amtDirect(label: string): string {
      const words = label.split(/\s+/)
      const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\S]{0,30}?')
      const re = new RegExp(pattern + '[\\s\\S]{0,10}?\\$?([\\d,]+\\.\\d{2})', 'i')
      const m  = norm.match(re)
      return m ? '$' + m[1] : '$0.00'
    }

    // ── Universal metadata ──
    const ssnMatch        = norm.match(/SSN[^:]*:\s*(XXX-XX-\d{4}|\d{3}-\d{2}-\d{4})/i)
    const taxPeriodMatch  = norm.match(/Tax Period(?:\s+Ending|\s+Requested)?:\s*\d{2}-\d{2}-(\d{4})/i)
      || norm.match(/Report for Tax Period Ending:\s*\d{2}-\d{2}-(\d{4})/i)
    const taxYear         = taxPeriodMatch?.[1] || ''
    const requestDateMatch = norm.match(/Request Date:\s*(\d{2}-\d{2}-\d{4})/i)
    const requestDate     = requestDateMatch?.[1] || ''
    const cycleMatch      = norm.match(/Cycle posted:\s*(\d+)/i)
    const receivedMatch   = norm.match(/Received date:\s*(\d{2}-\d{2}-\d{4})/i)
    const filingStatusMatch = norm.match(/Filing status:\s*(\w+)/i)
    const formMatch       = norm.match(/(?:Taxpayer )?Form number:\s*([\w-]+)/i)
    const trackingMatch   = norm.match(/Tracking Number:\s*(\d+)/i)
    const ssnProvided     = norm.match(/SSN provided:\s*(XXX-XX-\d{4})/i)
      || norm.match(/Taxpayer Identification Number:\s*(XXX-XX-\d{4})/i)
    const nameMatch       = norm.match(/(?:XXX-XX-\d{4})\s+([A-Z][A-Z\s]+?)(?:\s+\d{3,}|\s+[A-Z]\s)/)?.[1]?.trim()

    if (isReturnTranscript) {
      // ── RETURN TRANSCRIPT parsing ──
      const parsed = {
        transcriptType: 'return',
        taxpayer: {
          ssn:          ssnProvided?.[1] || ssnMatch?.[1] || '—',
          name:         nameMatch || '—',
          taxYear,
          requestDate,
          filingStatus: filingStatusMatch?.[1] || '—',
          formNumber:   formMatch?.[1] || '1040',
          cyclePosted:  cycleMatch?.[1] || '—',
          receivedDate: receivedMatch?.[1] || '—',
          trackingNumber: trackingMatch?.[1] || '—',
        },
        income: {
          totalWages:          amt('Total wages'),
          businessIncome:      amtDirect('Business income or loss Schedule C'),
          totalIncome:         amt('Total income'),
          adjustedGrossIncome: amt('Adjusted gross income'),
          scheduleEIC_SelfEmploymentIncome: amtDirect('Schedule EIC Self-employment income per computer'),
        },
        adjustments: {
          selfEmploymentTaxDeduction: amtDirect('Self-employment tax deduction'),
          qualifiedBusinessIncome:    amtDirect('Qualified business income deduction'),
          totalAdjustments:           amt('Total adjustments'),
        },
        taxAndCredits: {
          taxableIncome:        amt('Taxable income'),
          tentativeTax:         amt('Tentative tax'),
          selfEmploymentTax:    amtDirect('Self employment tax'),
          totalTaxLiability:    amtDirect('Total tax liability taxpayer figures'),
          incomeTaxAfterCredits: amtDirect('Income tax after credits per computer'),
          standardDeduction:    amtDirect('Standard deduction per computer'),
          totalCredits:         amt('Total credits'),
        },
        payments: {
          federalWithheld:   amtDirect('Federal income tax withheld'),
          estimatedPayments: amt('Estimated tax payments'),
          totalPayments:     amt('Total payments'),
        },
        refundOrOwed: {
          amountOwed:       amt('Amount you owe'),
          balanceDue:       amtDirect('Balance due overpayment using taxpayer figure per computer'),
          estimatedPenalty: amt('Estimated tax penalty'),
        },
        scheduleC: {
          grossReceipts:     amtDirect('Gross receipts or sales'),
          totalExpenses:     amt('Total expenses'),
          homeOfficeExpense: amtDirect('Expense for business use of home'),
          netProfit:         amtDirect('Schedule C net profit or loss per computer'),
          naicsCode:         val('North American Industry Classification System'),
          accountMethod:     val('Account method'),
        },
        selfEmploymentTax: {
          totalSETax:        amtDirect('Total Self-Employment tax per computer'),
          seIncome:          amtDirect('Total Self-Employment income'),
          socialSecurityTax: amtDirect('Self-Employment Social Security tax computer'),
          medicareTax:       amtDirect('Self-Employment Medicare tax per computer'),
        },
        qualifiedBusinessIncome: {
          qbiComponent:      amt('Qualified business income component'),
          totalQBI:          amt('Total qualified business income or loss'),
          deduction:         amt('Form 8995 net capital gains'),
        },
        transactions: [],
        balances: {
          assessedTax: amt('Total assessment per computer'),
          payments:    amt('Total payments'),
          credits:     amt('Total credits'),
          balance:     amt('Amount you owe'),
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
      const b1099Forms: any[] = []

      const w2Splits = norm.split(/Form W-2 Wage and Tax Statement/gi)
      for (let i = 1; i < w2Splits.length; i++) {
        const s = w2Splits[i]
        const nextForm = s.search(/Form (W-2|1099)/i)
        const section  = nextForm > 0 ? s.slice(0, nextForm) : s

        const w2Amt = (label: string): string => {
          const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
          const re = new RegExp(pattern + '\\s*:\\s*\\$?([\\d,]+\\.\\d{2})', 'i')
          const m  = section.match(re)
          return m ? '$' + m[1] : '$0.00'
        }

        const einMatch  = section.match(/Employer Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{7})/i)
        const empMatch  = section.match(/(?:XX-XXX\d+|\d{2}-\d{7})\s+([A-Z][A-Z0-9\s&]+?)(?:\s{2,}|\s+\d{4,}|Employee)/i)
        const subMatch  = section.match(/Submission Type:\s*([^\n]+?)(?:\s{2,}|$)/i)

        w2Forms.push({
          employer:       empMatch?.[1]?.trim() || '—',
          ein:            einMatch?.[1] || '—',
          wages:          w2Amt('Wages, Tips and Other Compensation'),
          fedWithheld:    w2Amt('Federal Income Tax Withheld'),
          ssWages:        w2Amt('Social Security Wages'),
          ssTax:          w2Amt('Social Security Tax Withheld'),
          medicareWages:  w2Amt('Medicare Wages and Tips'),
          medicareTax:    w2Amt('Medicare Tax Withheld'),
          submissionType: subMatch?.[1]?.trim() || '—',
        })
      }

      const b1099Splits = norm.split(/Form 1099-B Proceeds from Broker/gi)
      for (let i = 1; i < b1099Splits.length; i++) {
        const s = b1099Splits[i]
        const nextForm = s.search(/Form (W-2|1099)/i)
        const section  = nextForm > 0 ? s.slice(0, nextForm) : s

        const bAmt = (label: string): string => {
          const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
          const re = new RegExp(pattern + '\\s*:\\s*\\$?([\\d,]+\\.\\d{2})', 'i')
          const m  = section.match(re)
          return m ? '$' + m[1] : '$0.00'
        }

        const bVal = (label: string): string => {
          const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
          const re = new RegExp(pattern + '\\s*:\\s*([^\\n$]+?)(?:\\s{2,}|$)', 'i')
          const m  = section.match(re)
          return m ? m[1].trim() : '—'
        }

        const proceedsNum = parseFloat(bAmt('Proceeds').replace(/[^0-9.]/g, '')) || 0
        const basisNum    = parseFloat(bAmt('Cost or Basis').replace(/[^0-9.]/g, '')) || 0
        const netGL       = proceedsNum - basisNum
        const gainLossStr = netGL < 0 ? `-$${Math.abs(netGL).toFixed(2)}` : `$${netGL.toFixed(2)}`

        const descMatch = section.match(/Description:\s*([^\n]+?)(?:\s{2,}|Second Notice|Date acquired)/i)
        const rawDesc   = descMatch?.[1]?.trim() || '—'

        b1099Forms.push({
          payer:           bVal('Payer\'s Federal Identification Number').replace(/XX-XXX\d+\s*/i, '').trim() || '—',
          fin:             section.match(/Federal Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{9})/i)?.[1] || '—',
          accountNumber:   section.match(/Account Number:\s*([\w\d]+)/i)?.[1] || '—',
          dateSold:        section.match(/Date Sold or Disposed:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '—',
          dateAcquired:    section.match(/Date acquired:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '—',
          proceeds:        bAmt('Proceeds'),
          costBasis:       bAmt('Cost or Basis'),
          gainLoss:        gainLossStr,
          description:     rawDesc,
          gainType:        bVal('Type of gain or loss'),
          noncovered:      bVal('Noncovered Security Indicator'),
          fatca:           section.match(/FATCA Filing Requirement:\s*([^\n]+?)(?:\s{2,}|$)/i)?.[1]?.trim() || '—',
          form8949:        bVal('Applicable Check Box on Form 8949'),
        })
      }

      const totalWages    = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.wages.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalFedWH    = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.fedWithheld.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalProceeds = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.proceeds.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalBasis    = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.costBasis.replace(/[^0-9.]/g, '') || '0'), 0)

      const parsed = {
        transcriptType: 'wage-income',
        taxpayer: {
          ssn:    ssnProvided?.[1] || ssnMatch?.[1] || norm.match(/TIN Provided:\s*(XXX-XX-\d{4})/i)?.[1] || '—',
          taxYear,
          requestDate,
          trackingNumber: trackingMatch?.[1] || '—',
        },
        w2Forms,
        b1099Forms,
        summary: {
          totalW2s:         w2Forms.length,
          total1099Bs:      b1099Forms.length,
          totalWages:       `$${totalWages.toFixed(2)}`,
          totalFedWithheld: `$${totalFedWH.toFixed(2)}`,
          totalProceeds:    `$${totalProceeds.toFixed(2)}`,
          totalBasis:       `$${totalBasis.toFixed(2)}`,
          totalGainLoss:    `$${(totalProceeds - totalBasis).toFixed(2)}`,
        },
        transactions: [],
        balances: { assessedTax: '', payments: '', credits: '', balance: '' },
        metadata: {
          transcriptType: 'Wage and Income Transcript',
          requestDate,
          parsedAt: new Date().toISOString(),
        },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // ── RECORD OF ACCOUNT parsing ──
    if (isRecordOfAccount) {
      const transactions: any[] = []
      const txSection = text.match(/TRANSACTIONS[\s\S]*?(?=SSN provided:|$)/i)?.[0] || ''
      const txLines   = txSection.split('\n')

      const cleanDesc = (raw: string, code: string): string => {
        return raw
          .replace(/\b\d{8}\b/g, '')
          .replace(/\b\d{5}-\d{3}-\d{5}-\d{1,2}\b/g, '')
          .replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '')
          .replace(/\b00\b/g, '')
          .replace(/\s{2,}/g, ' ')
          .trim() || getCodeDescription(code)
      }

      for (const line of txLines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        const p = trimmed.match(/^(\d{3})\s+(.+?)\s+(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
        if (p) {
          transactions.push({ code: p[1], date: p[3], description: cleanDesc(p[2], p[1]), amount: p[4], impact: cleanDesc(p[2], p[1]) })
          continue
        }
        const p2 = trimmed.match(/^(\d{3})\s+(.+?)\s+\d{11,}\s+\d{8}\s+(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})\s*$/)
        if (p2) {
          transactions.push({ code: p2[1], date: p2[3], description: cleanDesc(p2[2], p2[1]), amount: p2[4], impact: cleanDesc(p2[2], p2[1]) })
          continue
        }
        const p3 = trimmed.match(/^(\d{3})\s{2,}([A-Za-z].+?)\s{2,}(\d{2}-\d{2}-\d{4})\s+([\$\-]?[\d,]+\.\d{2})/)
        if (p3) {
          transactions.push({ code: p3[1], date: p3[3], description: cleanDesc(p3[2], p3[1]), amount: p3[4], impact: cleanDesc(p3[2], p3[1]) })
          continue
        }
        const p4 = trimmed.match(/^(\d{3})\s+(.+?)\s+(\d{2}-\d{2}-\d{4})\s+(-\$[\d,]+\.\d{2})\s*$/)
        if (p4) {
          transactions.push({ code: p4[1], date: p4[3], description: cleanDesc(p4[2], p4[1]), amount: p4[4], impact: cleanDesc(p4[2], p4[1]) })
          continue
        }
      }

      const acctBalance    = norm.match(/Account balance:\s*\$([\d,\.]+)/i)?.[1]
      const accruedInt     = norm.match(/Accrued interest:\s*\$([\d,\.]+)/i)?.[1]
      const accruedPenalty = norm.match(/Accrued penalty:\s*\$([\d,\.]+)/i)?.[1]
      const payoffAmt      = norm.match(/Account balance plus accruals[^:]*:\s*\$([\d,\.]+)/i)?.[1]

      const parsed = {
        transcriptType: 'record-of-account',
        taxpayer: {
          ssn:           ssnProvided?.[1] || ssnMatch?.[1] || '—',
          name:          nameMatch || '—',
          taxYear,
          requestDate,
          filingStatus:  filingStatusMatch?.[1] || '—',
          formNumber:    formMatch?.[1] || norm.match(/Form Number:\s*([\w-]+)/i)?.[1] || '—',
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
          totalWages:          amt('Total wages'),
          businessIncome:      amtDirect('Business income or loss Schedule C'),
          totalIncome:         amt('Total income'),
          adjustedGrossIncome: amt('Adjusted gross income'),
        },
        taxAndCredits: {
          taxableIncome:     amt('Taxable income'),
          tentativeTax:      amt('Tentative tax'),
          selfEmploymentTax: amtDirect('Self employment tax'),
          totalTaxLiability: amtDirect('Total tax liability taxpayer figures'),
          totalCredits:      amt('Total credits'),
          standardDeduction: amtDirect('Standard deduction per computer'),
        },
        payments: {
          federalWithheld:   amtDirect('Federal income tax withheld'),
          estimatedPayments: amt('Estimated tax payments'),
          totalPayments:     amt('Total payments'),
        },
        refundOrOwed: {
          amountOwed: amt('Amount you owe'),
          balanceDue: amtDirect('Balance due overpayment using taxpayer figure per computer'),
        },
        scheduleC: {
          grossReceipts:     amtDirect('Gross receipts or sales'),
          totalExpenses:     amt('Total expenses'),
          homeOfficeExpense: amtDirect('Expense for business use of home'),
          netProfit:         amtDirect('Schedule C net profit or loss per computer'),
          naicsCode:         val('North American Industry Classification System'),
        },
        selfEmploymentTax: {
          totalSETax:        amtDirect('Total Self-Employment tax per computer'),
          seIncome:          amtDirect('Total Self-Employment income'),
          socialSecurityTax: amtDirect('Self-Employment Social Security tax computer'),
          medicareTax:       amtDirect('Self-Employment Medicare tax per computer'),
        },
        balances: {
          assessedTax: amt('Total assessment per computer'),
          payments:    amt('Total payments'),
          credits:     amt('Total credits'),
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

    const cleanDescAcct = (raw: string, code: string): string => {
      return raw
        .replace(/\b\d{8}\b/g, '')
        .replace(/\b\d{5}-\d{3}-\d{5}-\d{1,2}\b/g, '')
        .replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '')
        .replace(/\b00\b/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim() || getCodeDescription(code)
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Must start with a 3-digit transaction code
      if (!/^\d{3}\s/.test(trimmed)) continue

      // Pattern 1: code desc date amount
      const dateMatch = trimmed.match(/(\d{2}-\d{2}-\d{4})\s+([\-]?\$[\d,]+\.\d{2})\s*$/)
      if (dateMatch) {
        const date   = dateMatch[1]
        const amount = dateMatch[2]
        const code   = trimmed.slice(0, 3)
        const middle = trimmed.slice(3, trimmed.lastIndexOf(dateMatch[0])).trim()
        const description = cleanDescAcct(middle, code)
        transactions.push({ code, date, amount, description, impact: description })
        continue
      }

      // Pattern 2: code desc date negative-amount
      const p4 = trimmed.match(/^(\d{3})\s+(.+?)\s+(\d{2}-\d{2}-\d{4})\s+(-\$[\d,]+\.\d{2})\s*$/)
      if (p4) {
        transactions.push({
          code: p4[1], date: p4[3],
          description: cleanDescAcct(p4[2], p4[1]),
          amount: p4[4], impact: cleanDescAcct(p4[2], p4[1]),
        })
        continue
      }
    }

    const balanceMatch       = norm.match(/Account\s+balance[:\s]+\$?([\d,\.]+)/i)
    const acctBalanceMatch   = norm.match(/Account\s+balance:\s*\$([\d,\.]+)/i)
    const accruedIntMatch    = norm.match(/Accrued\s+interest:\s*\$([\d,\.]+)/i)
    const accruedPenMatch    = norm.match(/Accrued\s+penalty:\s*\$([\d,\.]+)/i)
    const payoffMatch        = norm.match(/Account\s+balance\s+plus\s+accruals[^:]*:\s*\$([\d,\.]+)/i)
    const returnTypeMatch    = norm.match(/RETURN\s+TYPE[:\s]+([A-Z0-9\-]+)/i)

    const filingStatusMatch2 = norm.match(/Filing\s+status[:\s]+(\w+)/i)
    const agiMatch           = norm.match(/Adjusted\s+gross\s+income[:\s]+\$?([\d,\.]+)/i)
    const taxableIncMatch    = norm.match(/Taxable\s+income[:\s]+\$?([\d,\.]+)/i)
    const taxPerReturnMatch  = norm.match(/Tax\s+per\s+return[:\s]+\$?([\d,\.]+)/i)
    const procDateMatch      = norm.match(/Processing\s+date[:\s]+(\d{2}-\d{2}-\d{4})/i)
    const returnDueMatch     = norm.match(/Return\s+due\s+date[^:]*:\s*(\d{2}-\d{2}-\d{4})/i)

    const parsed = {
      transcriptType: 'account',
      taxpayer: {
        ssn:           ssnProvided?.[1] || ssnMatch?.[1] || '—',
        name:          nameMatch || '—',
        taxYear,
        requestDate,
        filingStatus:  filingStatusMatch?.[1] || '—',
        formNumber:    formMatch?.[1] || norm.match(/Form Number:\s*([\w-]+)/i)?.[1] || '—',
        cyclePosted:   cycleMatch?.[1] || '—',
        receivedDate:  receivedMatch?.[1] || '—',
        trackingNumber: trackingMatch?.[1] || '—',
      },
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
