'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

import { useAppSession } from '@/app/app/SessionContext'
import { getTokenPricing, purchaseTokens, type TokenPackage } from '@/lib/api'

const WORKER_BASE = 'https://api.taxmonitor.pro'
const PDFJS_VERSION = '3.11.174'

function getCodeDescription(code: string): string {
  const CODES: Record<string, string> = {
    '000': 'Establishment of tax module',
    '011': 'Entity created',
    '012': 'Entity updated',
    '013': 'Entity updated \u2014 name change',
    '014': 'Address change',
    '016': 'Employer identification number (EIN) change',
    '020': 'Name change',
    '036': 'Reactivate tax module',
    '050': 'Module blocked from automated collection',
    '054': 'Amended return filed \u2014 TC 54',
    '076': 'Duplicate return filed',
    '080': 'Entity updated \u2014 bankruptcy',
    '090': 'Penalty suspension \u2014 disaster relief',
    '150': 'Tax return filed \u2014 tax liability established',
    '151': 'Tax return filed \u2014 tax liability reduced',
    '152': 'Tax return filed \u2014 no tax liability',
    '160': 'Failure-to-file (FTF) penalty assessed',
    '161': 'Failure-to-file penalty abated',
    '166': 'Failure-to-pay (FTP) penalty assessed',
    '167': 'Failure-to-pay penalty abated',
    '170': 'Estimated tax penalty assessed',
    '171': 'Estimated tax penalty abated',
    '190': 'Accuracy-related penalty assessed',
    '196': 'Interest charged for late payment',
    '197': 'Interest abated',
    '240': 'Miscellaneous penalty assessed',
    '270': 'Failure-to-pay penalty assessed',
    '290': 'Additional tax assessed',
    '291': 'Tax decreased',
    '300': 'Additional tax assessed \u2014 examination',
    '301': 'Tax decreased \u2014 examination',
    '310': 'Additional tax assessed \u2014 automated underreporter',
    '370': 'Credit transferred from another module',
    '400': 'Earned income credit applied',
    '420': 'Examination of tax return initiated',
    '421': 'Examination closed \u2014 no change',
    '430': 'Estimated tax payment',
    '460': 'Extension of time to file granted',
    '470': 'Collection action suspended',
    '480': 'Offer in compromise (OIC) pending',
    '482': 'Offer in compromise accepted',
    '500': 'Installment agreement granted',
    '520': 'Collection suspended \u2014 pending litigation',
    '530': 'Currently not collectible (CNC) \u2014 hardship',
    '570': 'Additional liability pending \u2014 refund hold',
    '571': 'Additional liability resolved \u2014 hold released',
    '580': 'Notice of levy filed',
    '582': 'Federal tax lien (FTL) filed',
    '583': 'Federal tax lien released',
    '590': 'Statute of limitations extended',
    '610': 'Payment submitted with return',
    '620': 'Regular payment received',
    '650': 'Payment received',
    '670': 'Payment applied to balance due',
    '694': "Refund applied to next year's estimated tax",
    '700': 'Credit transferred to this module',
    '706': 'Credit transferred from another year',
    '720': 'Refundable credit applied',
    '766': 'Credit to your account (refundable credit)',
    '768': 'Earned income credit applied',
    '770': 'Interest credited to account',
    '800': 'Withholding credit applied',
    '806': 'Federal income tax withholding credit applied',
    '810': 'Refund freeze \u2014 refund held',
    '811': 'Refund freeze released',
    '820': 'Credit transferred to another account',
    '840': 'Manual refund issued',
    '846': 'Refund issued',
    '850': 'Overpayment applied to non-tax debt (TOP)',
    '898': 'Refund applied to non-tax debt (TOP offset)',
    '960': 'Power of attorney (POA) on file',
    '971': 'Notice issued to taxpayer',
    '977': 'Amended return filed \u2014 TC 977',
  }
  return CODES[code] || `IRS Transaction Code ${code}`
}

export default function TranscriptParser() {
  const session = useAppSession()
  const [balance, setBalance] = useState(session.balance)
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
  const [parseError, setParseError] = useState('')
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [pricingPackages, setPricingPackages] = useState<TokenPackage[]>([])
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [modalError, setModalError] = useState('')

  const pdfjsRef = useRef<any>(null)
  const pdfFileRef = useRef<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
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
    const saved = localStorage.getItem('tm_brand_logo')
    if (saved) setLogoDataUrl(saved)
  }, [])

  const handleRefreshBalance = async () => {
    if (!session?.accountId) return
    try {
      const tokenRes = await fetch(
        `${WORKER_BASE}/v1/tokens/balance/${session.accountId}`,
        { credentials: 'include' }
      )
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        const bal = tokenData.balance?.transcriptTokens
          ?? tokenData.transcript_tokens
          ?? tokenData.balance
          ?? 0
        setBalance(bal)
      }
    } catch { /* silently fail */ }
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

  const MAX_PDF_SIZE = 25 * 1024 * 1024 // 25 MB

  const handlePdfFile = (file: File) => {
    setParseError('')
    if (file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file.')
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      setParseError('File too large. Please upload a PDF under 25MB.')
      return
    }
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

    const isReturnTranscript  = /Form 1040 Tax Return Transcript/i.test(text)
    const isRecordOfAccount   = /Form 1040 Record of Account/i.test(text)
    const isWageAndIncome     = /Wage and Income Transcript/i.test(text)
    const isAccountTranscript = !isReturnTranscript && !isRecordOfAccount && !isWageAndIncome

    const norm = text.replace(/\s{2,}/g, ' ')

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
      return m ? m[1].trim().split(/\s{2,}/)[0].trim() : '\u2014'
    }

    function amtDirect(label: string): string {
      const words = label.split(/\s+/)
      const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\S]{0,30}?')
      const re = new RegExp(pattern + '[\\s\\S]{0,10}?\\$?([\\d,]+\\.\\d{2})', 'i')
      const m  = norm.match(re)
      return m ? '$' + m[1] : '$0.00'
    }

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
      const parsed = {
        transcriptType: 'return',
        taxpayer: { ssn: ssnProvided?.[1] || ssnMatch?.[1] || '\u2014', name: nameMatch || '\u2014', taxYear, requestDate, filingStatus: filingStatusMatch?.[1] || '\u2014', formNumber: formMatch?.[1] || '1040', cyclePosted: cycleMatch?.[1] || '\u2014', receivedDate: receivedMatch?.[1] || '\u2014', trackingNumber: trackingMatch?.[1] || '\u2014' },
        income: { totalWages: amt('Total wages'), businessIncome: amtDirect('Business income or loss Schedule C'), totalIncome: amt('Total income'), adjustedGrossIncome: amt('Adjusted gross income'), scheduleEIC_SelfEmploymentIncome: amtDirect('Schedule EIC Self-employment income per computer') },
        adjustments: { selfEmploymentTaxDeduction: amtDirect('Self-employment tax deduction'), qualifiedBusinessIncome: amtDirect('Qualified business income deduction'), totalAdjustments: amt('Total adjustments') },
        taxAndCredits: { taxableIncome: amt('Taxable income'), tentativeTax: amt('Tentative tax'), selfEmploymentTax: amtDirect('Self employment tax'), totalTaxLiability: amtDirect('Total tax liability taxpayer figures'), incomeTaxAfterCredits: amtDirect('Income tax after credits per computer'), standardDeduction: amtDirect('Standard deduction per computer'), totalCredits: amt('Total credits') },
        payments: { federalWithheld: amtDirect('Federal income tax withheld'), estimatedPayments: amt('Estimated tax payments'), totalPayments: amt('Total payments') },
        refundOrOwed: { amountOwed: amt('Amount you owe'), balanceDue: amtDirect('Balance due overpayment using taxpayer figure per computer'), estimatedPenalty: amt('Estimated tax penalty') },
        scheduleC: { grossReceipts: amtDirect('Gross receipts or sales'), totalExpenses: amt('Total expenses'), homeOfficeExpense: amtDirect('Expense for business use of home'), netProfit: amtDirect('Schedule C net profit or loss per computer'), naicsCode: norm.match(/(?:NAICS|North American Industry Classification System)[^:]*:\s*(\d{6})/i)?.[1] || '\u2014', accountMethod: norm.match(/Account\s+method:\s*(Cash|Accrual|Other)/i)?.[1] || '\u2014' },
        selfEmploymentTax: { totalSETax: amtDirect('Total Self-Employment tax per computer'), seIncome: amtDirect('Total Self-Employment income'), socialSecurityTax: amtDirect('Self-Employment Social Security tax computer'), medicareTax: amtDirect('Self-Employment Medicare tax per computer') },
        qualifiedBusinessIncome: { qbiComponent: amt('Qualified business income component'), totalQBI: amt('Total qualified business income or loss'), deduction: amt('Form 8995 net capital gains') },
        transactions: [],
        balances: { assessedTax: amt('Total assessment per computer'), payments: amt('Total payments'), credits: amt('Total credits'), balance: amt('Amount you owe') },
        metadata: { transcriptType: 'Form 1040 Tax Return Transcript', requestDate, parsedAt: new Date().toISOString() },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    if (isWageAndIncome) {
      const w2Forms: any[] = []
      const b1099Forms: any[] = []
      const w2Splits = norm.split(/Form W-2 Wage and Tax Statement/gi)
      for (let i = 1; i < w2Splits.length; i++) {
        const s = w2Splits[i]
        const nextForm = s.search(/Form (W-2|1099)/i)
        const section  = nextForm > 0 ? s.slice(0, nextForm) : s
        const w2Amt = (label: string): string => { const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'); const re = new RegExp(pattern + '\\s*:\\s*\\$?([\\d,]+\\.\\d{2})', 'i'); const m = section.match(re); return m ? '$' + m[1] : '$0.00' }
        const einMatch  = section.match(/Employer Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{7})/i)
        const empMatch  = section.match(/(?:XX-XXX\d+|\d{2}-\d{7})\s+([A-Z][A-Z0-9\s&]+?)(?:\s{2,}|\s+\d{4,}|Employee)/i)
        const subMatch  = section.match(/Submission\s+Type:\s*(Original\s+(?:document|W2)|Corrected|Amended)/i)
        w2Forms.push({ employer: empMatch?.[1]?.trim() || '\u2014', ein: einMatch?.[1] || '\u2014', wages: w2Amt('Wages, Tips and Other Compensation'), fedWithheld: w2Amt('Federal Income Tax Withheld'), ssWages: w2Amt('Social Security Wages'), ssTax: w2Amt('Social Security Tax Withheld'), medicareWages: w2Amt('Medicare Wages and Tips'), medicareTax: w2Amt('Medicare Tax Withheld'), submissionType: subMatch?.[1]?.trim() || '\u2014' })
      }
      const b1099Splits = norm.split(/Form 1099-B Proceeds from Broker/gi)
      for (let i = 1; i < b1099Splits.length; i++) {
        const s = b1099Splits[i]
        const nextForm = s.search(/Form (W-2|1099)/i)
        const section  = nextForm > 0 ? s.slice(0, nextForm) : s
        const bAmt = (label: string): string => { const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'); const re = new RegExp(pattern + '\\s*:\\s*\\$?([\\d,]+\\.\\d{2})', 'i'); const m = section.match(re); return m ? '$' + m[1] : '$0.00' }
        const bVal = (label: string): string => { const pattern = label.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'); const re = new RegExp(pattern + '\\s*:\\s*([^\\n$]+?)(?:\\s{2,}|$)', 'i'); const m = section.match(re); return m ? m[1].trim() : '\u2014' }
        const proceedsNum = parseFloat(bAmt('Proceeds').replace(/[^0-9.]/g, '')) || 0
        const basisNum    = parseFloat(bAmt('Cost or Basis').replace(/[^0-9.]/g, '')) || 0
        const netGL       = proceedsNum - basisNum
        const gainLossStr = netGL < 0 ? `-$${Math.abs(netGL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${netGL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        const descMatch = section.match(/Description:\s*([^\n]+?)(?:\s{2,}|Second Notice|Date acquired)/i)
        b1099Forms.push({ payer: bVal('Payer\'s Federal Identification Number').replace(/XX-XXX\d+\s*/i, '').trim() || '\u2014', fin: section.match(/Federal Identification Number[^:]*:\s*(XX-XXX\d+|\d{2}-\d{9})/i)?.[1] || '\u2014', accountNumber: section.match(/Account Number:\s*([\w\d]+)/i)?.[1] || '\u2014', dateSold: section.match(/Date Sold or Disposed:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '\u2014', dateAcquired: section.match(/Date acquired:\s*(\d{2}-\d{2}-\d{4})/i)?.[1] || '\u2014', proceeds: bAmt('Proceeds'), costBasis: bAmt('Cost or Basis'), gainLoss: gainLossStr, description: descMatch?.[1]?.trim() || '\u2014', gainType: section.match(/Type of gain or loss:\s*(Long-term|Short-term)/i)?.[1] || '\u2014', noncovered: section.match(/Noncovered Security Indicator:\s*(Nothing checked|Covered|Noncovered)/i)?.[1] || '\u2014', fatca: section.match(/FATCA Filing Requirement:\s*(Box not checked|Box checked)/i)?.[1] || '\u2014', form8949: (() => { const m = section.match(/Applicable Check Box on Form 8949:\s*([^\n]+?)(?:\s{2,}|Loss is|$)/i); return m ? m[1].trim().slice(0, 60) : '\u2014' })() })
      }
      const totalWages    = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.wages.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalFedWH    = w2Forms.reduce((s: number, w: any) => s + parseFloat(w.fedWithheld.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalProceeds = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.proceeds.replace(/[^0-9.]/g, '') || '0'), 0)
      const totalBasis    = b1099Forms.reduce((s: number, b: any) => s + parseFloat(b.costBasis.replace(/[^0-9.]/g, '') || '0'), 0)
      const parsed = {
        transcriptType: 'wage-income',
        taxpayer: { ssn: ssnProvided?.[1] || ssnMatch?.[1] || norm.match(/TIN Provided:\s*(XXX-XX-\d{4})/i)?.[1] || '\u2014', taxYear, requestDate, trackingNumber: trackingMatch?.[1] || '\u2014' },
        w2Forms, b1099Forms,
        summary: { totalW2s: w2Forms.length, total1099Bs: b1099Forms.length, totalWages: `$${totalWages.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, totalFedWithheld: `$${totalFedWH.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, totalProceeds: `$${totalProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, totalBasis: `$${totalBasis.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, totalGainLoss: `$${(totalProceeds - totalBasis).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        transactions: [], balances: { assessedTax: '', payments: '', credits: '', balance: '' },
        metadata: { transcriptType: 'Wage and Income Transcript', requestDate, parsedAt: new Date().toISOString() },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // Record of Account or Account Transcript
    const transactions: any[] = []
    const txRegex = /\b(\d{3})\s+((?:[A-Za-z][^$\n]*?)?)\s+(\d{2}-\d{2}-\d{4})\s+([-]?\$?[\d,]+\.\d{2})/g
    let txMatch
    const txStart = text.indexOf('TRANSACTIONS')
    const txEnd   = text.indexOf('This   Product   Contains Sensitive Taxpayer Data', txStart > 0 ? txStart : 0)
    const txSection = txStart > 0 ? text.slice(txStart, txEnd > txStart ? txEnd : undefined) : text
    while ((txMatch = txRegex.exec(txSection)) !== null) {
      const code = txMatch[1], rawDesc = txMatch[2].trim(), date = txMatch[3], rawAmount = txMatch[4]
      const amount = rawAmount.startsWith('$') || rawAmount.startsWith('-$') ? rawAmount : '$' + rawAmount
      if (code === 'COD' || rawDesc.includes('EXPLANATION')) continue
      const desc = rawDesc.replace(/\b\d{8}\b/g, '').replace(/\b\d{5}-\d{3}-\d{5}-\d\b/g, '').replace(/\b(NOTICE\d+|CP\s+\d+)\b/gi, '').replace(/\b00-00-0000\b/g, '').replace(/\b00\b/g, '').replace(/\s{2,}/g, ' ').trim()
      if (!desc && !getCodeDescription(code)) continue
      transactions.push({ code, date, amount, description: desc || getCodeDescription(code), impact: desc || getCodeDescription(code) })
    }
    const acctBalanceMatch   = norm.match(/Account\s+balance:\s*\$([\d,\.]+)/i)
    const balanceMatch       = norm.match(/Account\s+balance[:\s]+\$?([\d,\.]+)/i)
    const accruedIntMatch    = norm.match(/Accrued\s+interest:\s*\$([\d,\.]+)/i)
    const accruedPenMatch    = norm.match(/Accrued\s+penalty:\s*\$([\d,\.]+)/i)
    const payoffMatch        = norm.match(/Account\s+balance\s+plus\s+accruals[^:]*:\s*\$([\d,\.]+)/i)

    if (isRecordOfAccount) {
      const parsed = {
        transcriptType: 'record-of-account',
        taxpayer: { ssn: ssnProvided?.[1] || ssnMatch?.[1] || '\u2014', name: nameMatch || '\u2014', taxYear, requestDate, filingStatus: filingStatusMatch?.[1] || '\u2014', formNumber: formMatch?.[1] || norm.match(/Form Number:\s*([\w-]+)/i)?.[1] || '\u2014', cyclePosted: cycleMatch?.[1] || '\u2014', receivedDate: receivedMatch?.[1] || '\u2014', trackingNumber: trackingMatch?.[1] || '\u2014' },
        accountBalance: { balance: acctBalanceMatch ? `$${acctBalanceMatch[1]}` : '$0.00', accruedInt: accruedIntMatch ? `$${accruedIntMatch[1]}` : '$0.00', accruedPenalty: accruedPenMatch ? `$${accruedPenMatch[1]}` : '$0.00', payoffAmount: payoffMatch ? `$${payoffMatch[1]}` : '$0.00' },
        transactions,
        income: { totalWages: amt('Total wages'), businessIncome: amtDirect('Business income or loss Schedule C'), totalIncome: amt('Total income'), adjustedGrossIncome: amt('Adjusted gross income') },
        taxAndCredits: { taxableIncome: amt('Taxable income'), tentativeTax: amt('Tentative tax'), selfEmploymentTax: amtDirect('Self employment tax'), totalTaxLiability: amtDirect('Total tax liability taxpayer figures'), totalCredits: amt('Total credits'), standardDeduction: amtDirect('Standard deduction per computer') },
        payments: { federalWithheld: amtDirect('Federal income tax withheld'), estimatedPayments: amt('Estimated tax payments'), totalPayments: amt('Total payments') },
        refundOrOwed: { amountOwed: amt('Amount you owe'), balanceDue: amtDirect('Balance due overpayment using taxpayer figure per computer') },
        scheduleC: { grossReceipts: amtDirect('Gross receipts or sales'), totalExpenses: amt('Total expenses'), homeOfficeExpense: amtDirect('Expense for business use of home'), netProfit: amtDirect('Schedule C net profit or loss per computer'), naicsCode: norm.match(/(?:NAICS|North American Industry Classification System)[^:]*:\s*(\d{6})/i)?.[1] || '\u2014' },
        selfEmploymentTax: { totalSETax: amtDirect('Total Self-Employment tax per computer'), seIncome: amtDirect('Total Self-Employment income'), socialSecurityTax: amtDirect('Self-Employment Social Security tax computer'), medicareTax: amtDirect('Self-Employment Medicare tax per computer') },
        balances: { assessedTax: amt('Total assessment per computer'), payments: amt('Total payments'), credits: amt('Total credits'), balance: acctBalanceMatch ? `$${acctBalanceMatch[1]}` : '$0.00' },
        metadata: { transcriptType: 'Form 1040 Record of Account', requestDate, parsedAt: new Date().toISOString() },
      }
      setJsonText(JSON.stringify(parsed, null, 2))
      return
    }

    // Account transcript
    const filingStatusMatch2 = norm.match(/Filing\s+status[:\s]+(\w+)/i)
    const agiMatch           = norm.match(/Adjusted\s+gross\s+income[:\s]+\$?([\d,\.]+)/i)
    const taxableIncMatch    = norm.match(/Taxable\s+income[:\s]+\$?([\d,\.]+)/i)
    const taxPerReturnMatch  = norm.match(/Tax\s+per\s+return[:\s]+\$?([\d,\.]+)/i)
    const procDateMatch      = norm.match(/Processing\s+date[:\s]+(\d{2}-\d{2}-\d{4})/i)
    const returnDueMatch     = norm.match(/Return\s+due\s+date[^:]*:\s*(\d{2}-\d{2}-\d{4})/i)
    const parsed = {
      transcriptType: 'account',
      taxpayer: { ssn: ssnProvided?.[1] || ssnMatch?.[1] || '\u2014', name: nameMatch || '\u2014', taxYear, requestDate, filingStatus: filingStatusMatch?.[1] || '\u2014', formNumber: formMatch?.[1] || norm.match(/Form Number:\s*([\w-]+)/i)?.[1] || '\u2014', cyclePosted: cycleMatch?.[1] || '\u2014', receivedDate: receivedMatch?.[1] || '\u2014', trackingNumber: trackingMatch?.[1] || '\u2014' },
      transactions,
      balances: { assessedTax: '', payments: '', credits: '', balance: acctBalanceMatch ? `$${acctBalanceMatch[1]}` : (balanceMatch?.[1] ? `$${balanceMatch[1]}` : '$0.00'), accruedInt: accruedIntMatch ? `$${accruedIntMatch[1]}` : '$0.00', accruedPenalty: accruedPenMatch ? `$${accruedPenMatch[1]}` : '$0.00', payoffAmount: payoffMatch ? `$${payoffMatch[1]}` : '$0.00' },
      returnSummary: { filingStatus: filingStatusMatch2?.[1] || '\u2014', adjustedGrossIncome: agiMatch ? `$${agiMatch[1]}` : '\u2014', taxableIncome: taxableIncMatch ? `$${taxableIncMatch[1]}` : '\u2014', taxPerReturn: taxPerReturnMatch ? `$${taxPerReturnMatch[1]}` : '\u2014', processingDate: procDateMatch?.[1] || '\u2014', returnDueDate: returnDueMatch?.[1] || '\u2014' },
      metadata: { transcriptType: 'Account Transcript', requestDate, parsedAt: new Date().toISOString() },
    }
    setJsonText(JSON.stringify(parsed, null, 2))
  }

  const handleSavePreview = async () => {
    if (!session || !jsonText) return
    setPreviewStatus('Saving report...')
    try {
      const eventId = crypto.randomUUID()
      const res = await fetch(`${WORKER_BASE}/v1/transcripts/preview`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ event_id: eventId, report_data: JSON.parse(jsonText) }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setReportEventId(data.event_id); setReportUrl(data.report_url); setReportId(data.report_id); setPreviewSaved(true)
        setBalance(data.balance_after ?? 0)
        setPreviewStatus(`Report saved. 1 token used. ${data.balance_after} tokens remaining.`)
      } else {
        setPreviewStatus(data.message || data.error || 'Failed to save report.')
      }
    } catch {
      setPreviewStatus('Unable to save report. Please check your connection and try again.')
    }
  }

  const handleEmailReport = async () => {
    if (!session || !reportId || !reportEventId || !emailInput) return
    setEmailStatus('Sending...')
    const res = await fetch(`${WORKER_BASE}/v1/transcripts/report-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ report_id: reportId, email: emailInput, event_id: reportEventId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) setEmailStatus('Report link sent to ' + emailInput)
    else setEmailStatus(data.message || data.error || 'Failed to send.')
  }

  const handleCopy = (text: string, which: 'raw' | 'json') => {
    navigator.clipboard.writeText(text)
    if (which === 'raw') { setCopyRawLabel('Copied!'); setTimeout(() => setCopyRawLabel('Copy'), 2000) }
    else { setCopyJsonLabel('Copied!'); setTimeout(() => setCopyJsonLabel('Copy'), 2000) }
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePdfFile(file)
  }

  return (
    <>
      {/* Token bar */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-[--member-border] bg-[--member-card] px-5 py-3">
        <span className="text-[13px] text-white/60">
          <span className="font-semibold text-teal-400">{balance}</span> token{balance !== 1 ? 's' : ''} available
        </span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={handleRefreshBalance} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[13px] font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
            Refresh
          </button>
          <button type="button" onClick={handleOpenPurchaseModal} className="rounded-lg bg-teal-500 px-3 py-1.5 text-[13px] font-bold text-black transition hover:opacity-90">
            Buy Tokens
          </button>
        </div>
      </div>

      {/* Parser card */}
      <div className="rounded-xl border border-[--member-border] bg-[--member-card] overflow-hidden">
        {/* Flow steps */}
        <div className="flex items-center border-b border-[--member-border] px-5 py-3.5">
          <div className="flex flex-1 items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/15 text-xs font-bold text-teal-400">&#10003;</span>
            <div>
              <div className="text-[13px] font-semibold text-white/80">Balance</div>
              <div className="text-[11px] text-white/30">{balance} tokens</div>
            </div>
          </div>
          <div className="mx-1 h-px w-6 bg-white/[0.08]" />
          <div className="flex flex-1 items-center gap-2.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${pdfReady ? 'bg-teal-500/15 text-teal-400' : 'bg-white/[0.06] text-white/40'}`}>
              {pdfReady ? '\u2713' : '2'}
            </span>
            <div>
              <div className="text-[13px] font-semibold text-white/80">Upload PDF</div>
              <div className="text-[11px] text-white/30">{pdfFileName || 'Choose transcript'}</div>
            </div>
          </div>
          <div className="mx-1 h-px w-6 bg-white/[0.08]" />
          <div className="flex flex-1 items-center gap-2.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${previewSaved ? 'bg-teal-500/15 text-teal-400' : rawText ? 'bg-teal-500/15 text-teal-400' : 'bg-white/[0.06] text-white/40'}`}>
              {previewSaved ? '\u2713' : '3'}
            </span>
            <div>
              <div className={`text-[13px] font-semibold ${rawText ? 'text-white/80' : 'text-white/40'}`}>Output</div>
              <div className="text-[11px] text-white/30">Report &amp; email</div>
            </div>
          </div>
        </div>

        {/* Upload zone */}
        <div className="p-5">
          <div
            className={`cursor-pointer rounded-xl border-2 border-dashed px-5 py-9 text-center transition ${dragging ? 'border-teal-500 bg-teal-500/5' : 'border-white/[0.12] hover:border-teal-500 hover:bg-teal-500/[0.02]'}`}
            role="button" tabIndex={0} aria-label="Upload transcript PDF"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          >
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-teal-500/15 bg-teal-500/[0.08]">
              <Upload className="h-5 w-5 text-teal-400" />
            </div>
            <div className="text-base font-bold text-white/90">Drop IRS transcript PDF here</div>
            <div className="mt-1 text-[13px] text-white/40">Account &middot; Return &middot; Wage &amp; Income &middot; Record of Account</div>
            {pdfFileName && <span className="mt-2 inline-block text-[13px] font-semibold text-teal-400">{pdfFileName}</span>}
          </div>
          {parseError && <p className="mt-2 text-[13px] text-red-300">{parseError}</p>}
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfFile(f) }} />

          {/* Logo upload */}
          <div className="mt-4 border-t border-[--member-border] pt-4">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-white/30">Firm Logo (optional)</span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-lg border border-white/[0.08] bg-[#07090f] px-3.5 py-1.5 text-[13px] font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
                Choose File
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
              {logoDataUrl && (
                <button type="button" onClick={handleRemoveLogo} className="rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3.5 py-1.5 text-[13px] font-semibold text-red-300 transition hover:bg-red-500/15">
                  Remove Logo
                </button>
              )}
              <span className="text-xs text-white/40">{logoFileName || 'No file chosen \u2014 logo appears on saved reports'}</span>
            </div>
            {logoDataUrl && (
              <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-[--member-border] bg-[#07090f] p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoDataUrl} alt="Firm logo" className="h-12 w-12 rounded-md bg-[#0b0e1a] object-contain p-1" />
                <div>
                  <div className="text-[13px] font-semibold text-white/80">Saved logo</div>
                  <p className="text-xs text-white/40">Stays on this device until removed.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output card */}
      <div className="mt-4 rounded-xl border border-[--member-border] bg-[--member-card] p-5">
        <p className="mb-3.5 text-[15px] font-bold text-white/90">Output</p>

        <div className="mb-3.5 flex flex-wrap gap-2.5">
          <button type="button" disabled={!pdfReady} onClick={handleExtractRaw} className="flex-1 min-w-[160px] rounded-lg border border-white/[0.08] bg-[#07090f] px-3.5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed">
            Extract raw text
          </button>
          <button type="button" disabled={!rawText} onClick={handleParseStructured} className="flex-1 min-w-[160px] rounded-lg border border-white/[0.08] bg-[#07090f] px-3.5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed">
            Parse structured JSON
          </button>
          <button type="button" disabled={!jsonText || previewSaved || balance === 0} onClick={handleSavePreview} className="flex-1 min-w-[160px] rounded-lg bg-teal-500 px-3.5 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed">
            Save report (1 token)
          </button>
        </div>

        {balance === 0 && <p className="mb-3.5 text-[13px] text-amber-400">No tokens \u2014 purchase tokens to save reports.</p>}

        <div className="mb-3.5 rounded-lg border border-[--member-border] bg-[#07090f] px-4 py-3 text-[13px] text-white/60">
          {previewStatus}
        </div>

        <div className="mb-3.5 grid gap-2.5 md:grid-cols-2">
          <div className="rounded-lg border border-[--member-border] bg-[#07090f] p-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-[--member-border] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-white/30">Raw text</span>
              <button type="button" className="text-xs font-semibold text-teal-400" onClick={() => handleCopy(rawText, 'raw')}>{copyRawLabel}</button>
            </div>
            <pre className="member-scroll min-h-[80px] max-h-[280px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/40">
              {rawText || '\u2014 awaiting extraction \u2014'}
            </pre>
          </div>
          <div className="rounded-lg border border-[--member-border] bg-[#07090f] p-3.5">
            <div className="mb-2.5 flex items-center justify-between border-b border-[--member-border] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-white/30">Structured JSON</span>
              <button type="button" className="text-xs font-semibold text-teal-400" onClick={() => handleCopy(jsonText, 'json')}>{copyJsonLabel}</button>
            </div>
            <pre className="member-scroll min-h-[80px] max-h-[280px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-white/40">
              {jsonText || '\u2014 awaiting parse \u2014'}
            </pre>
          </div>
        </div>

        {/* Email section */}
        <div className="border-t border-[--member-border] pt-3.5">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-white/30">Email report link to client</span>
          <div className="flex gap-2.5 items-end">
            <input
              type="email" placeholder="client@firm.com" autoComplete="email"
              value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 rounded-lg border border-[--member-border] bg-[#07090f] px-3.5 py-2.5 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-teal-500/40"
            />
            <button type="button" disabled={!previewSaved || !emailInput} onClick={handleEmailReport} className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed">
              Send link
            </button>
          </div>
          {emailStatus !== 'Not ready.' && <p className="mt-2 text-xs text-white/40">{emailStatus}</p>}
        </div>
      </div>

      {/* Purchase modal */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setPurchaseModalOpen(false)}>
          <div className="w-full max-w-[560px] rounded-2xl border border-[--member-border] bg-[#0b0e1a] p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white/90">Purchase Tokens</h2>
              <button type="button" onClick={() => setPurchaseModalOpen(false)} className="text-white/40 transition hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {pricingPackages.length === 0 && !modalError && <p className="text-xs text-white/40">Loading packages...</p>}
            {modalError && <p className="mb-3.5 text-[13px] text-red-300">{modalError}</p>}
            {pricingPackages.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {pricingPackages.map((pkg) => (
                  <div key={pkg.price_id} className={`relative rounded-xl border bg-[#07090f] p-6 text-center transition hover:border-white/20 ${pkg.badge === 'Popular' ? 'border-teal-500/35' : 'border-[--member-border]'}`}>
                    {pkg.badge && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-2.5 py-0.5 text-[10px] font-bold text-black">{pkg.badge}</div>}
                    <div className="mb-2.5 text-[13px] font-semibold text-white/60">{pkg.label}</div>
                    <div className="text-[32px] font-extrabold leading-none text-teal-400">{pkg.tokens}</div>
                    <div className="mb-3 text-xs text-white/40">tokens</div>
                    <div className="mb-4 text-lg font-bold text-white/90">${pkg.price}</div>
                    <button type="button" disabled={purchaseLoading === pkg.price_id} onClick={() => handlePurchase(pkg.price_id)} className="w-full rounded-lg bg-teal-500 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed">
                      {purchaseLoading === pkg.price_id ? 'Redirecting...' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
