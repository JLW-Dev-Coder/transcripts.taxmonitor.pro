'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

import styles from './dashboard.module.css'
import { api, getTokenBalance, getTokenPricing, purchaseTokens, type TokenPackage } from '@/lib/api'

const WORKER_BASE = 'https://api.taxmonitor.pro'
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
  const [reportId, setReportId] = useState('')
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [pathname, setPathname] = useState('')

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

    // Fetch session using cookie-based auth (.taxmonitor.pro cookie)
    api.getSession()
      .then((res) => {
        if (res.ok && res.session) {
          const bal = res.session.transcript_tokens ?? 0
          setSession({
            email:   res.session.email,
            tokenId: res.session.account_id,
            balance: bal,
          })
          setBalance(bal)
        } else {
          window.location.href = '/login/'
        }
      })
      .catch(() => { window.location.href = '/login/' })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  const handleRefreshBalance = async () => {
    if (!session?.tokenId) return
    try {
      const tokenRes = await fetch(
        `${WORKER_BASE}/v1/tokens/balance/${session.tokenId}`,
        { credentials: 'include' }
      )
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        const bal = tokenData.balance?.transcriptTokens
          ?? tokenData.transcript_tokens
          ?? tokenData.balance
          ?? 0
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
    await api.logout()
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
    const nameMatch       = norm.match(/XXX-XX-\d{4}\s+([A-Z][A-Z\s]{2,30}?)(?:\s+\d{3,}|\s*$)/)?.[1]?.trim()
      || norm.match(/Taxpayer Identification Number:\s*XXX-XX-\d{4}\s+([A-Z][A-Z\s]{2,30}?)(?:\s+\d|\s*$)/)?.[1]?.trim()

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
          naicsCode:         norm.match(/(?:NAICS|North American Industry Classification System)[^:]*:\s*(\d{6})/i)?.[1] || '—',
          accountMethod:     norm.match(/Account\s+method:\s*(Cash|Accrual|Other)/i)?.[1] || '—',
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
        const subMatch  = section.match(/Submission\s+Type:\s*(Original\s+(?:document|W2)|Corrected|Amended)/i)

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
        const gainLossStr = netGL < 0
          ? `-$${Math.abs(netGL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `$${netGL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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
          gainType:        section.match(/Type of gain or loss:\s*(Long-term|Short-term)/i)?.[1] || '—',
          noncovered:      section.match(/Noncovered Security Indicator:\s*(Nothing checked|Covered|Noncovered)/i)?.[1] || '—',
          fatca:           section.match(/FATCA Filing Requirement:\s*(Box not checked|Box checked)/i)?.[1] || '—',
          form8949:        (() => {
            const m = section.match(/Applicable Check Box on Form 8949:\s*([^\n]+?)(?:\s{2,}|Loss is|$)/i)
            return m ? m[1].trim().slice(0, 60) : '—'
          })(),
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
          totalWages:       `$${totalWages.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalFedWithheld: `$${totalFedWH.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalProceeds:    `$${totalProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalBasis:       `$${totalBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalGainLoss:    `$${(totalProceeds - totalBasis).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

      // Scan the entire raw text for transaction code patterns
      const txRegex = /\b(\d{3})\s+((?:[A-Za-z][^$\n]*?)?)\s+(\d{2}-\d{2}-\d{4})\s+([-]?\$?[\d,]+\.\d{2})/g
      let roaMatch

      // Only scan the TRANSACTIONS section if it exists
      const roaTxStart = text.indexOf('TRANSACTIONS')
      const roaTxEnd   = text.indexOf('This   Product   Contains Sensitive Taxpayer Data', roaTxStart > 0 ? roaTxStart : 0)
      const roaTxSection = roaTxStart > 0
        ? text.slice(roaTxStart, roaTxEnd > roaTxStart ? roaTxEnd : undefined)
        : text

      while ((roaMatch = txRegex.exec(roaTxSection)) !== null) {
        const code    = roaMatch[1]
        const rawDesc = roaMatch[2].trim()
        const date    = roaMatch[3]
        const rawAmount = roaMatch[4]
        const amount = rawAmount.startsWith('$') || rawAmount.startsWith('-$')
          ? rawAmount
          : '$' + rawAmount

        if (code === 'COD' || rawDesc.includes('EXPLANATION')) continue

        const desc = rawDesc
          .replace(/\b\d{8}\b/g, '')
          .replace(/\b\d{5}-\d{3}-\d{5}-\d\b/g, '')
          .replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '')
          .replace(/\b00-00-0000\b/g, '')
          .replace(/\b00\b/g, '')
          .replace(/\s{2,}/g, ' ')
          .trim()

        if (!desc && !getCodeDescription(code)) continue

        transactions.push({
          code,
          date,
          amount,
          description: desc || getCodeDescription(code),
          impact:      desc || getCodeDescription(code),
        })
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
          naicsCode:         norm.match(/(?:NAICS|North American Industry Classification System)[^:]*:\s*(\d{6})/i)?.[1] || '—',
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

    // Scan the entire raw text for transaction code patterns
    const acctTxRegex = /\b(\d{3})\s+((?:[A-Za-z][^$\n]*?)?)\s+(\d{2}-\d{2}-\d{4})\s+([-]?\$?[\d,]+\.\d{2})/g
    let acctMatch

    // Only scan the TRANSACTIONS section if it exists
    const acctTxStart = text.indexOf('TRANSACTIONS')
    const acctTxEnd   = text.indexOf('This   Product   Contains Sensitive Taxpayer Data', acctTxStart > 0 ? acctTxStart : 0)
    const acctTxSection = acctTxStart > 0
      ? text.slice(acctTxStart, acctTxEnd > acctTxStart ? acctTxEnd : undefined)
      : text

    while ((acctMatch = acctTxRegex.exec(acctTxSection)) !== null) {
      const code    = acctMatch[1]
      const rawDesc = acctMatch[2].trim()
      const date    = acctMatch[3]
      const rawAmount = acctMatch[4]
      const amount = rawAmount.startsWith('$') || rawAmount.startsWith('-$')
        ? rawAmount
        : '$' + rawAmount

      if (code === 'COD' || rawDesc.includes('EXPLANATION')) continue

      const desc = rawDesc
        .replace(/\b\d{8}\b/g, '')
        .replace(/\b\d{5}-\d{3}-\d{5}-\d\b/g, '')
        .replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '')
        .replace(/\b00-00-0000\b/g, '')
        .replace(/\b00\b/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()

      if (!desc && !getCodeDescription(code)) continue

      transactions.push({
        code,
        date,
        amount,
        description: desc || getCodeDescription(code),
        impact:      desc || getCodeDescription(code),
      })
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
      metadata: { transcriptType: 'Account Transcript', requestDate, parsedAt: new Date().toISOString() },
    }
    setJsonText(JSON.stringify(parsed, null, 2))
  }

  const handleSavePreview = async () => {
    if (!session || !jsonText) return
    setPreviewStatus('Saving report...')

    const eventId = crypto.randomUUID()

    const res = await fetch(`${WORKER_BASE}/v1/transcripts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      setReportId(data.report_id)
      setPreviewSaved(true)
      setBalance(data.balance_after ?? 0)
      setSession(prev => prev ? { ...prev, balance: data.balance_after ?? 0 } : prev)
      setPreviewStatus(`Report saved. 1 token used. ${data.balance_after} tokens remaining. You can now email it to your client or open the report below.`)
    } else {
      setPreviewStatus(data.message || data.error || 'Failed to save report.')
    }
  }

  const handleEmailReport = async () => {
    if (!session || !reportId || !reportEventId || !emailInput) return
    setEmailStatus('Sending...')
    const res = await fetch(`${WORKER_BASE}/v1/transcripts/report-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        report_id: reportId,
        email: emailInput,
        event_id: reportEventId,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) {
      setEmailStatus('Report link sent to ' + emailInput)
    } else {
      setEmailStatus(data.message || data.error || 'Failed to send.')
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
    return (
      <div className={styles.loadingState}>
        <span className={styles.spinner} />
      </div>
    )
  }

  const initials = session?.email
    ? session.email.slice(0, 2).toUpperCase()
    : 'TT'

  const navLinks = [
    { href: '/app/dashboard/', label: 'Dashboard', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/></svg>
    )},
    { href: '/app/reports/', label: 'Reports', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4.5h12M3 9h8M3 13.5h5"/></svg>
    )},
    { href: '/app/receipts/', label: 'Receipts', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="14" height="12" rx="2"/><path d="M6 8h6M6 11.5h4"/></svg>
    )},
  ]

  const accountLinks = [
    { href: '/app/token-usage/', label: 'Token Usage', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="3"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2"/></svg>
    )},
    { href: '/app/calendar/', label: 'Calendar', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="14" height="13" rx="2"/><path d="M6 2v2M12 2v2M2 8h14"/></svg>
    )},
    { href: '/app/affiliate/', label: 'Affiliate', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="5" cy="9" r="2.5"/><circle cx="13" cy="5" r="2.5"/><circle cx="13" cy="13" r="2.5"/><path d="M7.3 8.2l3.4-2M7.3 9.8l3.4 2"/></svg>
    )},
    { href: '/app/support/', label: 'Support', icon: (
      <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><path d="M9 6a2 2 0 011.9 2.6c-.3.8-1.9 2.4-1.9 2.4"/><circle cx="9" cy="14" r=".5" fill="currentColor"/></svg>
    )},
  ]

  return (
    <div className={styles.appShell}>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>

        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogoGroup}>
            <span className={styles.brandMark}>TT</span>
            {!sidebarCollapsed && (
              <div>
                <div className={styles.brandName}>Transcript Tax Monitor</div>
                <div className={styles.brandSub}>Pro Dashboard</div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 2L4 6l3 4"/>
              </svg>
            </button>
          )}
          {sidebarCollapsed && (
            <button
              type="button"
              className={styles.sidebarCollapsedToggle}
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 3l5 5-5 5"/>
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          {!sidebarCollapsed && <div className={styles.navSection}>Workspace</div>}
          {sidebarCollapsed && <div style={{ height: 20 }} />}
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href || pathname === href.slice(0,-1) ? styles.navLinkActive : ''}`}
              title={sidebarCollapsed ? label : undefined}
            >
              {icon}
              <span className={styles.navLabel}>{label}</span>
            </Link>
          ))}
          {!sidebarCollapsed && <div className={styles.navSection}>Account</div>}
          {sidebarCollapsed && <div style={{ height: 20 }} />}
          {accountLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href || pathname === href.slice(0,-1) ? styles.navLinkActive : ''}`}
              title={sidebarCollapsed ? label : undefined}
            >
              {icon}
              <span className={styles.navLabel}>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userRow} title={session?.email}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{session?.email}</div>
              <div className={styles.userPlan}>{balance} token{balance !== 1 ? 's' : ''} remaining</div>
            </div>
          </div>
          <button type="button" onClick={handleSignOut} className={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.mainShell}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.breadcrumbHome}>TTMP</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbPage}>Dashboard</span>
          </div>
          <div className={styles.topbarRight}>
            <div className={`${styles.tokenPill} ${balance > 0 ? styles.tokenPillGreen : styles.tokenPillAmber}`}>
              <span className={styles.tokenDot} />
              {balance} token{balance !== 1 ? 's' : ''}
            </div>
            <button type="button" onClick={handleRefreshBalance} className={styles.btnSmall}>
              Refresh
            </button>
            <button type="button" onClick={handleOpenPurchaseModal} className={styles.btnPrimary}>
              Buy Tokens
            </button>
          </div>
        </header>

        {/* Content */}
        <main className={styles.workspaceContent}>

          {/* Stat cards */}
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Available tokens</div>
              <div className={`${styles.statValue} ${balance > 0 ? styles.statValueTeal : styles.statValueAmber}`}>{balance}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Reports saved</div>
              <div className={styles.statValue}>—</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Account</div>
              <div className={`${styles.statValue} ${styles.statValueSmall}`}>{session?.email}</div>
            </div>
          </div>

          {/* Parser card */}
          <div className={styles.parserCard}>

            {/* Flow steps — visual only, not clickable tabs */}
            <div className={styles.flowHeader}>
              <div className={styles.flowStep}>
                <span className={`${styles.stepBadge} ${styles.stepBadgeDone}`}>✓</span>
                <div>
                  <div className={`${styles.stepTitle} ${styles.stepTitleActive}`}>Balance</div>
                  <div className={styles.stepSub}>{balance} tokens</div>
                </div>
              </div>
              <div className={styles.flowConnector} />
              <div className={styles.flowStep}>
                <span className={`${styles.stepBadge} ${pdfReady ? styles.stepBadgeDone : styles.stepBadgeActive}`}>
                  {pdfReady ? '✓' : '2'}
                </span>
                <div>
                  <div className={`${styles.stepTitle} ${styles.stepTitleActive}`}>Upload PDF</div>
                  <div className={styles.stepSub}>{pdfFileName || 'Choose transcript'}</div>
                </div>
              </div>
              <div className={styles.flowConnector} />
              <div className={styles.flowStep}>
                <span className={`${styles.stepBadge} ${previewSaved ? styles.stepBadgeDone : rawText ? styles.stepBadgeActive : styles.stepBadgeIdle}`}>
                  {previewSaved ? '✓' : '3'}
                </span>
                <div>
                  <div className={`${styles.stepTitle} ${rawText ? styles.stepTitleActive : ''}`}>Output</div>
                  <div className={styles.stepSub}>Report &amp; email</div>
                </div>
              </div>
            </div>

            {/* Upload panel */}
            <div className={styles.parserSection}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <polyline points="9 15 12 12 15 15"/>
                  </svg>
                </div>
                <div className={styles.uploadZoneTitle}>Drop IRS transcript PDF here</div>
                <div className={styles.uploadZoneSub}>Account · Return · Wage &amp; Income · Record of Account</div>
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

              {/* Logo upload */}
              <div className={styles.logoSection}>
                <span className={styles.sectionLabel}>Firm Logo (optional)</span>
                <div className={styles.logoActions}>
                  <label className={styles.btnSecondary} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    Choose File
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
                  <span className={styles.parserNote}>{logoFileName || 'No file chosen — logo appears on saved reports'}</span>
                </div>
                {logoDataUrl && (
                  <div className={styles.logoPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoDataUrl} alt="Firm logo" className={styles.logoPreviewImage} />
                    <div>
                      <div className={styles.logoPreviewName}>Saved logo</div>
                      <p className={styles.parserNote}>Stays on this device until removed.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output card — always visible */}
          <div className={styles.outputCard}>
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
                  style={{ padding: '10px 20px' }}
                >
                  Send link
                </button>
              </div>
              {emailStatus !== 'Not ready.' && (
                <p className={styles.parserNote} style={{ marginTop: 8 }}>{emailStatus}</p>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Purchase modal — unchanged */}
      {purchaseModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPurchaseModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Purchase Tokens</div>
              <button type="button" className={styles.modalClose} onClick={() => setPurchaseModalOpen(false)} aria-label="Close">✕</button>
            </div>
            {pricingPackages.length === 0 && !modalError && <p className={styles.parserNote}>Loading packages...</p>}
            {modalError && <p className={styles.modalError}>{modalError}</p>}
            {pricingPackages.length > 0 && (
              <div className={styles.packageGrid}>
                {pricingPackages.map((pkg) => (
                  <div key={pkg.price_id} className={`${styles.packageCard} ${pkg.badge === 'Popular' ? styles.packageCardPopular : ''}`}>
                    {pkg.badge && <div className={styles.packagePopularBadge}>{pkg.badge}</div>}
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
