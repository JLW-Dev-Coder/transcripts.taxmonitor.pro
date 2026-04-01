'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = 'https://api.virtuallaunch.pro'

function buildReportHtml(rd: any, logoDataUrl: string | null): string {
  const isReturn  = rd?.transcriptType === 'return'
  const reportDate = new Date().toLocaleDateString()
  const taxpayer   = rd?.taxpayer || {}
  const logo = logoDataUrl
    ? `<img src="${logoDataUrl}" style="max-width:160px;height:auto;" />`
    : `<div style="width:160px;height:110px;background:#f3f4f6;border:2px dashed #d1d5db;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;text-align:center;font-weight:800;padding:8px;"><div>Company Logo</div><div style="margin-top:6px;font-size:10px;font-weight:600;color:#6b7280;line-height:1.3;">Upload from dashboard</div></div>`

  function infoBlock(label: string, value: string) {
    return `<div class="info-block"><div class="info-label">${label}</div><div class="info-value">${value || '—'}</div></div>`
  }

  function statusCard(label: string, value: string, colorClass = '') {
    return `<div class="status-card"><div class="status-value ${colorClass}">${value || '—'}</div><div class="status-label">${label}</div></div>`
  }

  function lineRow(label: string, value: string, bold = false) {
    return `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e5e7eb;font-size:13px;${bold ? 'font-weight:800;border-top:2px solid #7c3aed;margin-top:6px;' : ''}"><span style="color:${bold ? '#0b0a14' : '#374151'}">${label}</span><span style="font-weight:${bold ? '800' : '600'};color:${bold ? '#7c3aed' : '#0b0a14'}">${value}</span></div>`
  }

  function getCodeDesc(code: string): string {
    const d: Record<string,string> = {'150':'Tax return filed','276':'Penalty for late payment','196':'Interest charged','460':'Extension of time to file','971':'Notice issued','530':'Currently not collectible','500':'Installment agreement','582':'Federal tax lien','810':'Refund freeze','570':'Additional liability pending','846':'Refund issued','806':'Withholding credit'}
    return d[code] || `TC ${code}`
  }

  const isWageIncome = rd?.transcriptType === 'wage-income'
  const isRecordOfAccount = rd?.transcriptType === 'record-of-account'

  const headerTitle = isReturn ? 'Tax Return Transcript Report'
    : isWageIncome ? 'Wage & Income Transcript Report'
    : isRecordOfAccount ? 'Record of Account Report'
    : 'IRS Account Transcript Report'

  const headerSub = isReturn ? 'Form 1040 Return Analysis'
    : isWageIncome ? 'W-2 & 1099 Analysis'
    : isRecordOfAccount ? 'Account + Return Combined Analysis'
    : 'Account Transaction Analysis'

  const headerHtml = `
    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left">
            <h1>${headerTitle}</h1>
            <p>${headerSub}</p>
          </div>
          <div class="header-right">${logo}</div>
        </div>

        <div class="section">
          <div class="section-title">Taxpayer Information</div>
          <div class="info-grid">
            ${infoBlock('SSN', taxpayer.ssn)}
            ${infoBlock('Tax Period Ending', taxpayer.taxYear ? '12/31/' + taxpayer.taxYear : '—')}
            ${rd?.transcriptType !== 'wage-income' ? infoBlock('Filing Status', taxpayer.filingStatus) : ''}
            ${rd?.transcriptType !== 'wage-income' ? infoBlock('Form Number', taxpayer.formNumber) : ''}
            ${rd?.transcriptType !== 'account' && rd?.transcriptType !== 'wage-income' ? infoBlock('Received Date', taxpayer.receivedDate) : ''}
            ${rd?.transcriptType !== 'account' && rd?.transcriptType !== 'wage-income' ? infoBlock('Cycle Posted', taxpayer.cyclePosted) : ''}
            ${infoBlock('Request Date', taxpayer.requestDate || rd?.metadata?.requestDate)}
            ${infoBlock('Tracking Number', taxpayer.trackingNumber)}
          </div>
        </div>`

  if (isReturn) {
    const inc  = rd?.income || {}
    const adj  = rd?.adjustments || {}
    const tax  = rd?.taxAndCredits || {}
    const pay  = rd?.payments || {}
    const owe  = rd?.refundOrOwed || {}
    const schC = rd?.scheduleC || {}
    const se   = rd?.selfEmploymentTax || {}

    const amtOwed   = owe.amountOwed || '$0.00'
    const isBalance = parseFloat(amtOwed.replace(/[^0-9.]/g, '')) > 0
    const riskLevel = isBalance ? 'Balance Due' : 'Clean'
    const riskClass = isBalance ? 'attention' : 'low'

    return headerHtml + `
        <div class="section">
          <div class="section-title">Account Status</div>
          <div class="status-grid">
            ${statusCard('Total Income', inc.totalIncome)}
            ${statusCard('Total Tax', tax.totalTaxLiability)}
            ${statusCard('Amount Owed', amtOwed, riskClass)}
          </div>
          <div class="status-grid" style="grid-template-columns:repeat(2,1fr)">
            ${statusCard('Total Payments', pay.totalPayments)}
            ${statusCard('Status', riskLevel, riskClass)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">What This Means</div>
          <div class="summary-box">
            ${isBalance
              ? `This transcript shows a balance due of <strong>${amtOwed}</strong> for tax year ${taxpayer.taxYear}. The taxpayer had self-employment income of ${inc.businessIncome} and a total tax liability of ${tax.totalTaxLiability}. No payments were made against this liability. Immediate attention is recommended — penalties and interest may be accruing.`
              : `This transcript shows a clean filing for tax year ${taxpayer.taxYear}. Total income was ${inc.totalIncome} with a tax liability of ${tax.totalTaxLiability}. All obligations appear to be satisfied.`
            }
          </div>
        </div>

        <div class="report-footer">
          <span>Confidential — for named taxpayer and representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>

    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left"><h1>Income & Tax Detail</h1><p>Form 1040 Line Items</p></div>
          <div class="header-right">${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:120px;height:auto;" />` : ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Income</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Total Wages (W-2)', inc.totalWages)}
            ${lineRow('Business Income (Schedule C)', inc.businessIncome)}
            ${lineRow('Total Income', inc.totalIncome)}
            ${lineRow('Self-Employment Income (EIC)', inc.scheduleEIC_SelfEmploymentIncome)}
            ${lineRow('Adjusted Gross Income', inc.adjustedGrossIncome, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Adjustments & Deductions</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Self-Employment Tax Deduction', adj.selfEmploymentTaxDeduction)}
            ${lineRow('Qualified Business Income Deduction', adj.qualifiedBusinessIncome)}
            ${lineRow('Standard Deduction', tax.standardDeduction)}
            ${lineRow('Total Adjustments', adj.totalAdjustments, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tax Calculation</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Taxable Income', tax.taxableIncome)}
            ${lineRow('Tentative Tax', tax.tentativeTax)}
            ${lineRow('Self-Employment Tax', tax.selfEmploymentTax)}
            ${lineRow('Total Credits', tax.totalCredits)}
            ${lineRow('Total Tax Liability', tax.totalTaxLiability, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payments & Balance</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Federal Tax Withheld', pay.federalWithheld)}
            ${lineRow('Estimated Tax Payments', pay.estimatedPayments)}
            ${lineRow('Total Payments', pay.totalPayments)}
            ${lineRow('Total Tax Liability', tax.totalTaxLiability)}
            ${lineRow('Amount Owed / (Refund)', owe.amountOwed, true)}
          </div>
        </div>

        <div class="report-footer">
          <span>For IRS code definitions, consult IRS Publication 1546.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>

    ${schC.grossReceipts && schC.grossReceipts !== '$0.00' ? `
    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left"><h1>Schedule C & Self-Employment</h1><p>Business Income Analysis</p></div>
          <div class="header-right">${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:120px;height:auto;" />` : ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Schedule C — Business Income</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Gross Receipts / Sales', schC.grossReceipts)}
            ${lineRow('Total Expenses', schC.totalExpenses)}
            ${lineRow('Home Office Expense', schC.homeOfficeExpense)}
            ${lineRow('Net Profit / Loss', schC.netProfit, true)}
          </div>
          <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${infoBlock('NAICS Code', schC.naicsCode)}
            ${infoBlock('Accounting Method', schC.accountMethod)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Self-Employment Tax Breakdown</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Total SE Income', se.seIncome)}
            ${lineRow('Social Security Tax', se.socialSecurityTax)}
            ${lineRow('Medicare Tax', se.medicareTax)}
            ${lineRow('Total SE Tax', se.totalSETax, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Practitioner Notes</div>
          <div class="summary-box">
            <strong>Schedule C filed</strong> with gross receipts of ${schC.grossReceipts}. Net profit after home office deduction: ${schC.netProfit}. Self-employment tax of ${se.totalSETax} applies on net earnings. The QBI deduction of ${adj.qualifiedBusinessIncome} reduces taxable income. <strong>No estimated tax payments were made</strong> — consider advising on 2024 quarterly estimates to avoid penalty.
          </div>
        </div>

        <div class="report-footer">
          <span>This report is confidential and for the named taxpayer and their representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>
    ` : ''}
    `
  }

  // ── WAGE & INCOME report ──
  if (isWageIncome) {
    const sum    = rd?.summary || {}
    const w2s    = rd?.w2Forms || []
    const b1099s = rd?.b1099Forms || []

    const w2Rows = w2s.map((w: any) => `
      <div class="section" style="page-break-inside:avoid;break-inside:avoid;">
        <div class="section-title">W-2 — ${w.employer || 'Employer'}</div>
        <div class="info-grid">
          ${infoBlock('EIN', w.ein)}
          ${infoBlock('Submission Type', w.submissionType)}
          ${infoBlock('Wages & Tips', w.wages)}
          ${infoBlock('Federal Tax Withheld', w.fedWithheld)}
          ${infoBlock('Social Security Wages', w.ssWages)}
          ${infoBlock('SS Tax Withheld', w.ssTax)}
          ${infoBlock('Medicare Wages', w.medicareWages)}
          ${infoBlock('Medicare Tax Withheld', w.medicareTax)}
        </div>
      </div>`).join('')

    const b1099Rows = b1099s.map((b: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${b.dateSold}</td>
        <td style="font-size:11px;">${b.description}</td>
        <td>${b.gainType}</td>
        <td>${b.proceeds}</td>
        <td>${b.costBasis}</td>
        <td style="font-weight:800;color:${b.gainLoss.startsWith('-') ? '#dc2626' : '#059669'}">${b.gainLoss}</td>
      </tr>`).join('')

    return headerHtml + `
        <div class="section">
          <div class="section-title">Summary</div>
          <div class="status-grid">
            ${statusCard('W-2 Forms', String(sum.totalW2s || 0))}
            ${statusCard('1099-B Forms', String(sum.total1099Bs || 0))}
            ${statusCard('Total Wages', sum.totalWages)}
          </div>
          <div class="status-grid" style="grid-template-columns:repeat(2,1fr)">
            ${statusCard('Federal Withheld', sum.totalFedWithheld)}
            ${statusCard('Net Capital Gain/Loss', sum.totalGainLoss, parseFloat(sum.totalGainLoss?.replace(/[^0-9.-]/g, '') || '0') < 0 ? 'attention' : 'low')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">What This Means</div>
          <div class="summary-box">
            This Wage and Income transcript shows ${sum.totalW2s} W-2 form${sum.totalW2s !== 1 ? 's' : ''} with total wages of <strong>${sum.totalWages}</strong> and federal withholding of <strong>${sum.totalFedWithheld}</strong>. ${sum.total1099Bs > 0 ? `There ${sum.total1099Bs === 1 ? 'is' : 'are'} ${sum.total1099Bs} Form 1099-B transaction${sum.total1099Bs !== 1 ? 's' : ''} with total proceeds of ${sum.totalProceeds} and a net gain/loss of ${sum.totalGainLoss}.` : 'No 1099-B transactions were reported.'}
          </div>
        </div>

        ${w2Rows}

        ${b1099s.length > 0 ? `
          <div class="section">
            <div class="section-title">Form 1099-B — Investment Transactions</div>
            <div style="overflow-x:auto;">
              <table class="transaction-table">
                <thead><tr><th>#</th><th>Date Sold</th><th>Description</th><th>Term</th><th>Proceeds</th><th>Basis</th><th>Gain/Loss</th></tr></thead>
                <tbody>${b1099Rows}</tbody>
              </table>
            </div>
          </div>` : ''}

        <div class="report-footer">
          <span>This report is confidential and for the named taxpayer and representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>`
  }

  // ── RECORD OF ACCOUNT report ──
  if (isRecordOfAccount) {
    const acct = rd?.accountBalance || {}
    const inc  = rd?.income || {}
    const tax  = rd?.taxAndCredits || {}
    const pay  = rd?.payments || {}
    const owe  = rd?.refundOrOwed || {}
    const schC = rd?.scheduleC || {}
    const se   = rd?.selfEmploymentTax || {}
    const roaTransactions: any[] = rd?.transactions || []

    const hasBalance    = parseFloat((acct.balance || '$0').replace(/[^0-9.]/g, '')) > 0
    const hasPenalties  = parseFloat((acct.accruedPenalty || '$0').replace(/[^0-9.]/g, '')) > 0
    const riskClass     = hasBalance ? (hasPenalties ? 'attention' : 'moderate') : 'low'
    const riskLabel     = hasBalance ? (hasPenalties ? 'Action Required' : 'Balance Due') : 'Clean'

    const timelineHtml = roaTransactions.map((tx: any) => `
      <div class="timeline-item">
        <div><div class="timeline-date">${tx.date || '—'}</div><div class="timeline-code">TC ${tx.code || '—'}</div></div>
        <div><div class="timeline-description">${tx.description || getCodeDesc(tx.code)}</div><div class="timeline-impact">${tx.amount || '—'}</div></div>
      </div>`).join('')

    return headerHtml + `
        <div class="section">
          <div class="section-title">Account Balance</div>
          <div class="status-grid">
            ${statusCard('Balance Due', acct.balance, riskClass)}
            ${statusCard('Accrued Interest', acct.accruedInt, hasPenalties ? 'moderate' : '')}
            ${statusCard('Accrued Penalty', acct.accruedPenalty, hasPenalties ? 'attention' : '')}
          </div>
          <div class="status-grid" style="grid-template-columns:repeat(2,1fr)">
            ${statusCard('Payoff Amount', acct.payoffAmount, hasBalance ? 'attention' : 'low')}
            ${statusCard('Status', riskLabel, riskClass)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">What This Means</div>
          <div class="summary-box">
            ${hasBalance
              ? `This account shows a balance of <strong>${acct.balance}</strong> for tax year ${taxpayer.taxYear}. With accrued interest of ${acct.accruedInt} and penalties of ${acct.accruedPenalty}, the total payoff amount is <strong>${acct.payoffAmount}</strong>. ${hasPenalties ? '<strong>Immediate action is recommended.</strong> Penalties and interest continue to accrue daily.' : 'Contact the IRS or consider an installment agreement to resolve this balance.'}`
              : `This account shows a clean status for tax year ${taxpayer.taxYear} with no outstanding balance.`
            }
          </div>
        </div>

        ${roaTransactions.length > 0 ? `
          <div class="section">
            <div class="section-title">Account History — ${roaTransactions.length} Transactions</div>
            <div class="timeline">${timelineHtml}</div>
          </div>` : ''}

        <div class="report-footer">
          <span>Confidential — for named taxpayer and representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>

    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left"><h1>Return Detail</h1><p>Income, Tax & Balance Breakdown</p></div>
          <div class="header-right">${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:120px;height:auto;" />` : ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Income</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Total Wages', inc.totalWages)}
            ${lineRow('Business Income (Schedule C)', inc.businessIncome)}
            ${lineRow('Total Income', inc.totalIncome)}
            ${lineRow('Adjusted Gross Income', inc.adjustedGrossIncome, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Tax Calculation</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Taxable Income', tax.taxableIncome)}
            ${lineRow('Tentative Tax', tax.tentativeTax)}
            ${lineRow('Self-Employment Tax', tax.selfEmploymentTax)}
            ${lineRow('Total Credits', tax.totalCredits)}
            ${lineRow('Total Tax Liability', tax.totalTaxLiability, true)}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payments & Resolution</div>
          <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
            ${lineRow('Federal Tax Withheld', pay.federalWithheld)}
            ${lineRow('Estimated Payments', pay.estimatedPayments)}
            ${lineRow('Total Payments', pay.totalPayments)}
            ${lineRow('Tax Liability', tax.totalTaxLiability)}
            ${lineRow('Amount Owed', owe.amountOwed)}
            ${lineRow('Payoff Amount (with accruals)', acct.payoffAmount, true)}
          </div>
        </div>

        ${schC.grossReceipts && schC.grossReceipts !== '$0.00' ? `
          <div class="section">
            <div class="section-title">Schedule C Summary</div>
            <div style="background:#f9fafb;padding:16px;border-radius:10px;border-left:4px solid #7c3aed;">
              ${lineRow('Gross Receipts', schC.grossReceipts)}
              ${lineRow('Home Office Expense', schC.homeOfficeExpense)}
              ${lineRow('Net Profit', schC.netProfit, true)}
            </div>
          </div>` : ''}

        <div class="section">
          <div class="section-title">Practitioner Notes</div>
          <div class="summary-box">
            <strong>Balance of ${acct.balance}</strong> with total payoff of ${acct.payoffAmount} as of ${taxpayer.requestDate || reportDate}.
            ${roaTransactions.some((t: any) => t.code === '530') ? '<strong>Currently Not Collectible (CNC) status active</strong> — collection is suspended. Monitor for status change.' : ''}
            ${roaTransactions.some((t: any) => t.code === '500') ? '<strong>Installment agreement on record.</strong>' : ''}
            ${roaTransactions.some((t: any) => t.code === '582') ? '<strong>Federal tax lien filed.</strong> Advise client on lien discharge or subordination options.' : ''}
            ${roaTransactions.some((t: any) => t.code === '971') ? `${roaTransactions.filter((t: any) => t.code === '971').length} notice(s) issued — verify client received and responded.` : ''}
            No estimated tax payments made for this period — consider advising on quarterly estimates.
          </div>
        </div>

        <div class="report-footer">
          <span>For IRS code definitions, consult IRS Publication 1546.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>`
  }

  // ── ACCOUNT TRANSCRIPT report ──
  const transactions: any[] = rd?.transactions || []
  const acctBal = rd?.balances || {}
  const retSum  = rd?.returnSummary || {}

  const hasAcctBalance = parseFloat((acctBal.balance || '$0').replace(/[^0-9.]/g, '')) > 0
  const hasAcctPenalty = parseFloat((acctBal.accruedPenalty || '$0').replace(/[^0-9.]/g, '')) > 0
  const acctRiskClass  = hasAcctBalance ? (hasAcctPenalty ? 'attention' : 'moderate') : 'low'

  const timelineHtml = transactions.map((tx: any) => `
    <div class="timeline-item">
      <div><div class="timeline-date">${tx.date || '—'}</div><div class="timeline-code">TC ${tx.code || '—'}</div></div>
      <div><div class="timeline-description">${tx.description || '—'}</div><div class="timeline-impact">${tx.impact || tx.amount || '—'}</div></div>
    </div>`).join('')

  const tableRowsHtml = transactions.map((tx: any) => `
    <tr>
      <td class="code-column">${tx.code || '—'}</td>
      <td>${tx.date || '—'}</td>
      <td>${tx.description || '—'}</td>
      <td style="font-size:12px;color:#6b7280;line-height:1.5;">${getCodeDesc(tx.code)}</td>
    </tr>`).join('')

  return headerHtml + `
        <div class="section">
          <div class="section-title">Account Status</div>
          <div class="status-grid">
            ${statusCard('Account Balance', acctBal.balance, hasAcctBalance ? 'attention' : 'low')}
            ${statusCard('Accrued Interest', acctBal.accruedInt || '—')}
            ${statusCard('Payoff Amount', acctBal.payoffAmount || '—', 'moderate')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">What This Means</div>
          <div class="summary-box">This account transcript shows ${transactions.length} transaction code${transactions.length !== 1 ? 's' : ''} for tax year ${taxpayer.taxYear}. Review the timeline below for a chronological view of all IRS actions on this account.</div>
        </div>

        ${transactions.length > 0 ? `
          <div class="section">
            <div class="section-title">Key Transcript Events</div>
            <div class="timeline">${timelineHtml}</div>
          </div>` : ''}

        ${retSum.adjustedGrossIncome && retSum.adjustedGrossIncome !== '—' ? `
          <div class="section">
            <div class="section-title">Return Summary</div>
            <div class="info-grid">
              ${infoBlock('Filing Status', retSum.filingStatus)}
              ${infoBlock('Adjusted Gross Income', retSum.adjustedGrossIncome)}
              ${infoBlock('Taxable Income', retSum.taxableIncome)}
              ${infoBlock('Tax Per Return', retSum.taxPerReturn)}
              ${infoBlock('Return Due Date', retSum.returnDueDate)}
              ${infoBlock('Processing Date', retSum.processingDate)}
            </div>
          </div>` : ''}

        <div class="section">
          <div class="section-title">Practitioner Notes</div>
          <div class="summary-box">
            Account balance of <strong>${acctBal.balance}</strong> for tax year ${taxpayer.taxYear}.
            ${parseFloat((acctBal.accruedInt || '$0').replace(/[^0-9.]/g, '')) > 0 ? ` Accrued interest: ${acctBal.accruedInt}.` : ''}
            ${parseFloat((acctBal.accruedPenalty || '$0').replace(/[^0-9.]/g, '')) > 0 ? ` Accrued penalty: ${acctBal.accruedPenalty}.` : ''}
            ${transactions.some((t: any) => t.code === '530') ? ' <strong>CNC status active</strong> — collection suspended due to hardship.' : ''}
            ${transactions.some((t: any) => t.code === '971') ? ` ${transactions.filter((t: any) => t.code === '971').length} IRS notice(s) issued — verify client received and responded.` : ''}
            ${transactions.some((t: any) => t.code === '500' || (t.code === '971' && t.description?.toLowerCase().includes('installment'))) ? ' Installment agreement on record.' : ''}
            ${transactions.some((t: any) => t.code === '846') ? ' Refund was previously issued on this account.' : ''}
            Total payoff amount as of report date: <strong>${acctBal.payoffAmount || acctBal.balance}</strong>.
          </div>
        </div>

        <div class="report-footer">
          <span>Confidential — for named taxpayer and representative only.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>

    ${transactions.length > 0 ? `
    <div class="report-page">
      <div class="page-content">
        <div class="report-header">
          <div class="header-left"><h1>Technical Analysis</h1><p>Transaction Code Breakdown</p></div>
          <div class="header-right">${logoDataUrl ? `<img src="${logoDataUrl}" style="max-width:120px;height:auto;" />` : ''}</div>
        </div>
        <div class="section">
          <div class="section-title">Transaction Code Details</div>
          <table class="transaction-table">
            <thead><tr><th>TC Code</th><th>Date</th><th>Description</th><th>Impact</th></tr></thead>
            <tbody>${tableRowsHtml}</tbody>
          </table>
        </div>
        <div class="balance-box">
          ${lineRow('Account Balance', acctBal.balance || '—')}
          ${lineRow('Accrued Interest', acctBal.accruedInt || '—')}
          ${lineRow('Accrued Penalty', acctBal.accruedPenalty || '—')}
          ${lineRow('Payoff Amount', acctBal.payoffAmount || '—', true)}
        </div>
        <div class="report-footer">
          <span>For IRS code definitions, consult IRS Publication 1546.</span>
          <span>Generated ${reportDate}</span>
        </div>
      </div>
    </div>` : ''}
  `
}

function ReportInner() {
  const searchParams            = useSearchParams()
  const reportId                = searchParams.get('report_id')
  const [status, setStatus]     = useState<'loading' | 'done' | 'error'>('loading')
  const [reportHtml, setReportHtml] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!reportId) { setError('No report ID provided.'); setStatus('error'); return }

    async function load() {
      try {
        const sessionId = sessionStorage.getItem('ttmp_session_id')
        const res = await fetch(`${API}/v1/transcripts/report/data?r=${reportId}`, {
          credentials: 'include',
          headers: sessionId ? { 'Authorization': `Bearer ${sessionId}` } : {},
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || `Failed to load report (${res.status})`)
        }
        const data = await res.json()
        const rd   = data.report_data || data
        const logo = localStorage.getItem('tm_brand_logo') || null
        setReportHtml(buildReportHtml(rd, logo))
        setStatus('done')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load report.')
        setStatus('error')
      }
    }
    load()
  }, [reportId])

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', gap: '1rem' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #1f2937', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading report…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (status === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#f87171', fontWeight: 600, fontSize: 16 }}>Failed to load report</p>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>{error}</p>
      <a href="/app/dashboard/" style={{ background: '#7c3aed', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 8 }}>Back to Dashboard</a>
    </div>
  )

  return (
    <div style={{ background: '#020617', minHeight: '100vh' }} className="report-outer">
      {/* Toolbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(30,41,59,0.6)', background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(12px)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <a href="https://transcript.taxmonitor.pro/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000' }}>TT</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Transcript Tax Monitor Pro</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>IRS Transcript Analysis Report</div>
          </div>
        </a>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{ padding: '7px 14px', background: '#14b8a6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#000', cursor: 'pointer', fontFamily: 'inherit' }}>
            Print / Save PDF
          </button>
          <a href="/app/dashboard/" style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(30,41,59,0.6)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            ← Back
          </a>
        </div>
      </div>

      {/* Report output */}
      <div style={{ padding: '32px 16px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <style>{REPORT_CSS}</style>
        <div ref={containerRef} dangerouslySetInnerHTML={{ __html: reportHtml }} />
      </div>

      <style>{`
  @media print {
    nav, [style*="position: sticky"], [style*="position:sticky"] { display: none !important; }
    body { background: #fff !important; margin: 0 !important; }
    html { background: #fff !important; }
  }
`}</style>
    </div>
  )
}

const REPORT_CSS = `
  .report-page{width:100%;max-width:8.5in;margin:0 auto 28px;background:#fff;box-shadow:0 18px 45px rgba(0,0,0,.35);border-radius:16px;overflow:hidden;page-break-after:always;font-family:'DM Sans',system-ui,sans-serif;color:#0b0a14;}
  .page-content{padding:56px;background:#fff;}
  .report-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:44px;padding-bottom:18px;border-bottom:2px solid #0b0a14;}
  .header-left h1{font-size:32px;font-weight:800;color:#0b0a14;letter-spacing:-.5px;margin-bottom:6px;line-height:1.1;}
  .header-left p{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:700;}
  .section{margin-bottom:34px;}
  .section-title{font-size:13px;font-weight:800;color:#0b0a14;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;padding-left:10px;border-left:4px solid #7c3aed;}
  .info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:26px;}
  .info-block{background:#f9fafb;padding:14px;border-radius:10px;border-left:3px solid #7c3aed;}
  .info-label{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
  .info-value{font-size:16px;font-weight:700;color:#0b0a14;word-break:break-word;}
  .status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px;}
  .status-card{background:linear-gradient(135deg,#f9fafb,#f3f4f6);padding:18px;border-radius:12px;border:1px solid #e5e7eb;text-align:center;}
  .status-value{font-size:20px;font-weight:800;color:#0b0a14;margin-bottom:6px;min-height:26px;line-height:1.1;}
  .status-value.low{color:#059669;}
  .status-value.moderate{color:#d97706;}
  .status-value.attention{color:#dc2626;}
  .status-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;}
  .summary-box{background:rgba(124,58,237,.08);border-left:4px solid #7c3aed;padding:18px;border-radius:10px;line-height:1.7;color:#374151;font-size:14px;}
  .timeline{margin-top:14px;}
  .timeline-item{display:grid;grid-template-columns:140px 1fr;gap:24px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #e5e7eb;}
  .timeline-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
  .timeline-date{font-size:12px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:.5px;}
  .timeline-code{font-size:11px;color:#6b7280;margin-top:4px;font-weight:700;}
  .timeline-description{font-size:15px;font-weight:800;color:#0b0a14;margin-bottom:8px;}
  .timeline-impact{font-size:13px;color:#6b7280;line-height:1.6;}
  .transaction-table{width:100%;border-collapse:collapse;margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;}
  .transaction-table th{background:rgba(124,58,237,.10);color:#374151;padding:12px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;}
  .transaction-table td{padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;vertical-align:top;}
  .transaction-table tr:hover{background:#f9fafb;}
  .transaction-table tr:last-child td{border-bottom:none;}
  .code-column{font-weight:800;color:#7c3aed;white-space:nowrap;}
  .balance-box{background:#f9fafb;padding:18px;border-radius:10px;margin-top:14px;border-left:4px solid #7c3aed;}
  .balance-row{display:grid;grid-template-columns:200px 1fr 120px;gap:16px;padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;}
  .balance-row:last-child{border-bottom:none;padding-top:14px;padding-bottom:0;border-top:2px solid #7c3aed;margin-top:8px;}
  .balance-label{font-weight:800;color:#0b0a14;}
  .balance-desc{color:#6b7280;}
  .balance-amount{text-align:right;font-weight:800;color:#7c3aed;white-space:nowrap;}
  .balance-row:last-child .balance-amount{font-size:16px;color:#0b0a14;}
  .report-footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:11px;color:#9ca3af;}
  @media(max-width:640px){.page-content{padding:28px}.info-grid,.status-grid{grid-template-columns:1fr}.timeline-item{grid-template-columns:1fr;gap:10px}.balance-row{grid-template-columns:1fr}.balance-amount{text-align:left}}
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body, html { background: #fff !important; }
    .report-outer { background: #fff !important; }
    .report-page { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; page-break-after: always; break-after: page; }
    .page-content { padding: .75in !important; }
    .section { page-break-inside: avoid; break-inside: avoid; }
    .timeline-item { page-break-inside: avoid; break-inside: avoid; }
    .status-grid { page-break-inside: avoid; break-inside: avoid; }
    .info-grid { page-break-inside: avoid; break-inside: avoid; }
    .balance-box { page-break-inside: avoid; break-inside: avoid; }
    .report-header { page-break-inside: avoid; break-inside: avoid; }
    .summary-box { page-break-inside: avoid; break-inside: avoid; }
    .transaction-table { page-break-inside: auto; }
    .transaction-table tr { page-break-inside: avoid; break-inside: avoid; }
  }
`

export default function ReportClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      </div>
    }>
      <ReportInner />
    </Suspense>
  )
}
