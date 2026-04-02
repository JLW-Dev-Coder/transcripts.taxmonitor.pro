"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './guide.module.css'

export default function GuideClient() {
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.body.classList.add('dark-mode')
      if (toggleRef.current) toggleRef.current.textContent = '☀️'
    }
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        window.print()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  function handleThemeToggle() {
    const isDark = document.body.classList.toggle('dark-mode')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    if (toggleRef.current) toggleRef.current.textContent = isDark ? '☀️' : '🌙'
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value.toLowerCase().trim()
    const cards = document.querySelectorAll<HTMLElement>('.code-card')
    cards.forEach(card => {
      if (!term || card.textContent?.toLowerCase().includes(term)) {
        card.classList.remove('hidden')
      } else {
        card.classList.add('hidden')
      }
    })
  }

  return (
    <>
      {/* Sticky Header */}
      <header className={styles.stickyHeader}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.navBrand}>
            <span className={styles.navLogo}>TM</span>
            <div>
              <div className={styles.navBrandName}>Transcript.Tax Monitor Pro</div>
              <div className={styles.navBrandSub}>Free IRS Transcript Code Guide</div>
            </div>
          </Link>
          <Link href="/" className={styles.navBack}>Back</Link>
        </div>
      </header>

      <main style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className={styles.pageContainer}>

          {/* Hero */}
          <div className={styles.heroSection}>
            <div className={styles.heroControls}>
              <button ref={toggleRef} type="button" aria-label="Toggle theme" className={styles.themeToggle} onClick={handleThemeToggle}>🌙</button>
            </div>
            <h1 className={styles.heroTitle}>The Ultimate Guide to IRS Transcript Codes</h1>
            <p className={styles.heroSubtitle}>Master Every Code, Every Time</p>
            <p className={styles.heroIntro}>A comprehensive reference guide for tax professionals. Stop guessing what those codes mean. This guide breaks down every IRS transcript code you'll encounter, complete with plain English explanations, real-world scenarios, and clear action steps.</p>
            <button className={styles.btnDownload} onClick={() => window.print()}>⬇ Download as PDF</button>
          </div>

          <div className={styles.sectionPadding}>

            {/* Introduction */}
            <section className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>Why This Guide Exists</h2>
              <p className={styles.sectionIntro}>IRS transcripts contain coded language designed for government systems, not for human readability. When clients receive a transcript, they see cryptic numbers and abbreviations that trigger anxiety and confusion even when nothing is wrong.</p>
              <p className={styles.sectionIntro}>As a tax professional, you're often the interpreter between the IRS and your clients. This guide gives you the complete reference to decode any transcript instantly, explain it with confidence, and provide clear action guidance.</p>
            </section>

            {/* Search */}
            <div className={styles.searchBox}>
              <label className={styles.searchLabel}>🔍 Quick Find in This Guide</label>
              <input type="text" className={styles.searchInput} placeholder="Type a code number, title, or keyword..." autoComplete="off" onChange={handleSearch} />
              <div className={styles.searchHint}>Search across all codes below to find what you need instantly</div>
            </div>

            {/* Assessment Codes */}
            <section className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Assessment Codes</h3>
              <p className={styles.categoryDescription}>Codes indicating changes made to the account by IRS processing or adjustments</p>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>150</div><div className={styles.codeTitle}>Return Received</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>IRS received and scanned the taxpayer's original return</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>This is a normal, routine code indicating successful receipt of the return by IRS processing centers</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>None. This is an informational code.</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>201</div><div className={styles.codeTitle}>Adjustment to Federal Tax</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>IRS made a change to the federal income tax liability on the return</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS adjusted the tax amount claimed on the return. This could be an increase or decrease depending on the associated transaction code</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Review the adjustment reason. If a refund was reduced, determine if additional credits or deductions apply</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>290</div><div className={styles.codeTitle}>Relief from Liability</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>IRS removed or abated a tax or penalty from the account</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>A liability was forgiven. This could be from an appeal, reasonable cause request, first-time penalty abatement, or other relief program</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Confirm the specific relief program. Ensure the client understands what triggered the abatement for future compliance</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>340</div><div className={styles.codeTitle}>Claim Recorded</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A claim for refund, amendment, or other statutory claim was filed and recorded</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS received a Form 1040-X, 941-X, or similar amended return or claim document</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Monitor for processing. Allow 3-6 months for IRS review and response depending on the claim type</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>420</div><div className={styles.codeTitle}>Statute Closing</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>The statute of limitations for IRS assessment or collection action has expired</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS can no longer assess additional taxes or initiate collection proceedings for this tax year</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>This is generally positive. Ensure all outstanding issues have been resolved before the statute closes</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
            </section>

            {/* Payment & Credit Codes */}
            <section className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Payment &amp; Credit Codes</h3>
              <p className={styles.categoryDescription}>Codes indicating payments received, credits applied, and payment method information</p>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>806</div><div className={styles.codeTitle}>Payment Received</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A payment was received and posted to the account</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>This is a normal code showing money was received by the IRS. Could be from estimated tax payments, extensions, or balance due payments</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Verify the payment amount matches what was sent. Cross-reference with payment confirmation records</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>846</div><div className={styles.codeTitle}>Refund Issued</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A refund was processed and paid to the taxpayer</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS approved and disbursed a refund. Check the date to confirm when funds should arrive (typically 21 days for direct deposit)</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Confirm the refund amount is correct. If direct deposit, verify the account information. Follow up if funds don't arrive within stated timeframe</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>570</div><div className={styles.codeTitle}>Refund Hold / Offset</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A refund was intercepted and applied to another tax liability, or held pending review</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS is holding the refund temporarily or offsetting it against other debts (other tax years, child support, student loans). This is a serious flag</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>IMMEDIATE. Determine the offset reason. If it's a mistake, file Form 8379 (Injured Spouse Claim) or contact IRS immediately</span></div><span className={`${styles.riskBadge} ${styles.riskImmediate}`}>Immediate Action</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>671</div><div className={styles.codeTitle}>Estimated Tax Payment</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>An estimated tax payment (Form 1040-ES) was received and credited</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The taxpayer made a quarterly estimated payment. This reduces the balance due when the return is filed</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Verify the payment was for the correct quarter and year. Ensure it's credited before filing the return</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
            </section>

            {/* Refund Codes */}
            <section className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Refund Codes</h3>
              <p className={styles.categoryDescription}>Codes specifically related to refund processing, holds, and status</p>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>768</div><div className={styles.codeTitle}>Refund Pending</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A refund is in process but not yet issued</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The return was accepted and approved for refund. The refund is queued for payment processing</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Wait. This is normal. Allow 21 days for direct deposit or 4-6 weeks for check delivery</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>772</div><div className={styles.codeTitle}>Refund Accepted</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>The return was accepted for filing and the refund was approved</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>This is a positive milestone. The return passed IRS validation and is moving through processing</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>None. Track the refund status through Where's My Refund or the account transcript</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>890</div><div className={styles.codeTitle}>Refund Funded</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>The refund was paid (funds transmitted to the taxpayer's bank or check issued)</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>Money is on the way. For direct deposit, expect 1-2 business days. For checks, expect 7-10 business days</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Confirm arrival with client. If not received within expected timeframe, initiate a trace</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
            </section>

            {/* Collection Activity Codes */}
            <section className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Collection Activity Codes</h3>
              <p className={styles.categoryDescription}>Codes indicating collection notices, levies, liens, and enforcement action</p>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>501</div><div className={styles.codeTitle}>Reversal</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A previous transaction was reversed or cancelled</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS undid a previous action. This could mean a payment reversal, cancelled assessment, or corrected error</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Understand why the reversal occurred. Contact IRS if unexpected to clarify the reason</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>520</div><div className={styles.codeTitle}>Notice Issued</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>The IRS issued a notice to the taxpayer</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The taxpayer should have received correspondence about this account. Could be routine or action-required</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>CRITICAL: Confirm the client received the notice. If not, call IRS to request reissuance. Do not ignore notices</span></div><span className={`${styles.riskBadge} ${styles.riskImmediate}`}>Immediate Action</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>610</div><div className={styles.codeTitle}>Lien Filed</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A federal tax lien was filed on the taxpayer's property</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>This is serious. The IRS has a legal claim on all the taxpayer's assets. This appears on credit reports and affects borrowing ability</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>IMMEDIATE ACTION REQUIRED. Develop a payment plan, compromise offer, or currently not collectible status. Consider representation</span></div><span className={`${styles.riskBadge} ${styles.riskImmediate}`}>Immediate Action</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>622</div><div className={styles.codeTitle}>Levy Released</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A wage or bank levy was released</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The IRS stopped garnishing the taxpayer's wages or bank account. This is positive and means the account is resolving</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Notify the employer/bank that the levy is released. Confirm no future levies are in place</span></div><span className={`${styles.riskBadge} ${styles.riskLow}`}>Low Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>650</div><div className={styles.codeTitle}>Installment Plan</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>An installment agreement (payment plan) was established</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The taxpayer can pay over time instead of as a lump sum. This stops collection action while payments are made</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Ensure client understands the payment amount and due date. Missed payments will default the agreement</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
            </section>

            {/* Notice & Adjustment Codes */}
            <section className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>Notice &amp; Adjustment Codes</h3>
              <p className={styles.categoryDescription}>Codes for IRS notices, correspondence items, and account adjustments</p>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>971</div><div className={styles.codeTitle}>Correspondence Item</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>A notice or correspondence was generated and mailed to the taxpayer</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>This is a placeholder for multiple notice types (CP2000, CP2501, etc). The specific notice type determines action</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>CRITICAL: Always follow up on 971 codes. Verify the client received the notice within 30 days of the transcript date</span></div><span className={`${styles.riskBadge} ${styles.riskImmediate}`}>Immediate Action</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>766</div><div className={styles.codeTitle}>ITIN Returned</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>An Individual Taxpayer Identification Number (ITIN) was expended on a return</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The ITIN is no longer valid. A new ITIN must be applied for using Form W-7</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>File Form W-7 immediately if filing another return. Without a valid ITIN, the return may be rejected</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
              <div className={`${styles.codeCard} code-card`}><div className={styles.codeNumber}>846</div><div className={styles.codeTitle}>Refund Issued (Adjusted)</div><div className={styles.codeRow}><span className={styles.codeLabel}>What Triggered It</span><span className={styles.codeValue}>An adjusted refund was issued after a previous amount was changed</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>What It Means</span><span className={styles.codeValue}>The original refund was modified. This could be an increase or decrease based on IRS adjustments</span></div><div className={styles.codeRow}><span className={styles.codeLabel}>Required Action</span><span className={styles.codeValue}>Verify the adjusted amount is correct. If decrease is unexpected, request explanation from IRS</span></div><span className={`${styles.riskBadge} ${styles.riskModerate}`}>Moderate Risk</span></div>
            </section>

            {/* Scenarios */}
            <section className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>Real Client Scenarios</h2>
              <p style={{color:'#6b7280',marginBottom:'2rem'}}>Three common situations showing how codes work together</p>
              <div className={styles.scenarioCard}>
                <div className={styles.scenarioTitle}>Scenario 1: "My Refund Is Late"</div>
                <p className={styles.scenarioIntro}>Client filed their 2024 return on February 1st. They expected a refund within 21 days. It's now mid-March and they're worried.</p>
                <div className={styles.scenarioCodes}>Codes Found: 150, 772, 768</div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 150: Return Received</div><div className={styles.annotationText}>The IRS scanned and received the paper return. This is normal and expected.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 772: Refund Accepted</div><div className={styles.annotationText}>The return passed validation and was accepted for processing. The refund was approved in principle.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 768: Refund Pending</div><div className={styles.annotationText}>The refund is currently in the queue for payment processing. This is normal. Most refunds take 21 days from acceptance.</div></div>
                <div className={styles.scenarioPositive}><strong className={styles.scenarioPositiveTitle}>✓ What to Tell the Client:</strong><p className={styles.scenarioPositiveText}>Your return is approved and your refund is being processed. This is perfectly normal for this time of year. You should see the money in your account within the next 7-14 days. If you don't see it by [21 days from today], contact us and we'll file a trace.</p></div>
              </div>
              <div className={styles.scenarioCard}>
                <div className={styles.scenarioTitle}>Scenario 2: "I Got a Notice and My Refund Stopped"</div>
                <p className={styles.scenarioIntro}>Client received Notice CP2501 (adjustment to their return). They're confused and want to know why their refund disappeared.</p>
                <div className={styles.scenarioCodes}>Codes Found: 150, 201, 520, 570</div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 150: Return Received</div><div className={styles.annotationText}>Standard receipt code.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 201: Adjustment to Federal Tax</div><div className={styles.annotationText}>The IRS disallowed a deduction or adjusted income. This increased the tax owed, reducing or eliminating the refund.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 520: Notice Issued</div><div className={styles.annotationText}>The IRS mailed correspondence explaining what was adjusted. This is the CP2501 they received.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 570: Refund Hold / Offset</div><div className={styles.annotationText}>The refund was halted pending review or was offset against the new balance due. This is NOT a positive sign.</div></div>
                <div className={styles.scenarioWarning}><strong className={styles.scenarioWarningTitle}>⚠ What to Tell the Client:</strong><p className={styles.scenarioWarningText}>The IRS adjusted your return and disallowed [specific deduction]. Your refund has been reduced or offset against the new amount owed. We need to review the notice carefully. If you disagree with this adjustment, we have 30 days to file a protest. Let's set up a meeting to discuss your options.</p></div>
              </div>
              <div className={styles.scenarioCard}>
                <div className={styles.scenarioTitle}>Scenario 3: "There's a Lien on My Account"</div>
                <p className={styles.scenarioIntro}>Self-employed client has back taxes from 2021. They want to buy a house but found out there's a federal lien on their file.</p>
                <div className={styles.scenarioCodes}>Codes Found: 520, 610, 650</div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 520: Notice Issued</div><div className={styles.annotationText}>Notice of Federal Tax Lien was mailed (usually Form 668A or 668F).</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 610: Lien Filed</div><div className={styles.annotationText}>The lien was filed with the county recorder. This appears on credit reports and prevents borrowing. This is the critical issue.</div></div>
                <div className={styles.scenarioAnnotation}><div className={styles.annotationLabel}>Code 650: Installment Plan</div><div className={styles.annotationText}>An installment agreement is in place. The lien may be released if payments are current and the balance drops below $10,000 (under Fresh Start Initiative rules).</div></div>
                <div className={styles.scenarioWarning}><strong className={styles.scenarioWarningTitle}>⚠ What to Tell the Client:</strong><p className={styles.scenarioWarningText}>Yes, there's a lien on your account from the back tax debt. The good news: you have an installment agreement active. If you maintain payments and get the balance under $10,000, we can request a subordination or release. You may be able to get a mortgage with the lien in place, but the lender may require proof of payments and an agreement from IRS. Let's discuss a payment strategy to get you under $10,000 ASAP.</p></div>
              </div>
            </section>

            {/* Red Flags */}
            <section className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>Red Flag Alerts</h2>
              <p style={{color:'#6b7280',marginBottom:'2rem'}}>Codes that require immediate attention. Never delay on these.</p>
              <div className={styles.redFlagCard}><div className={styles.redFlagCode}>570</div><div className={styles.redFlagTitle}>Refund Hold / Offset</div><p className={styles.redFlagDesc}>A refund is being held or offset against other debts. This is serious.</p><div className={styles.redFlagAction}><strong>Action Required:</strong> Within 24 hours, determine if this is a legitimate offset (other tax years, student loans, child support) or an error. If erroneous, file Form 8379 (Injured Spouse Claim) immediately. If legitimate but unexpected, request a payment plan to resolve the underlying liability.</div></div>
              <div className={styles.redFlagCard}><div className={styles.redFlagCode}>610</div><div className={styles.redFlagTitle}>Federal Tax Lien Filed</div><p className={styles.redFlagDesc}>A lien has been placed on the taxpayer's property. This is the most serious collection action short of levy.</p><div className={styles.redFlagAction}><strong>Action Required:</strong> IMMEDIATE. Contact IRS Collection Division. Consider: (1) Installment agreement to satisfy the debt, (2) Offer in Compromise, (3) Currently Not Collectible status, or (4) Professional representation. Request a subordination letter if the taxpayer needs to borrow money.</div></div>
              <div className={styles.redFlagCard}><div className={styles.redFlagCode}>520 + 971</div><div className={styles.redFlagTitle}>Notice Issued (Unresolved)</div><p className={styles.redFlagDesc}>A notice was issued and the notice code (971) appears without resolution codes. The notice may be unresolved.</p><div className={styles.redFlagAction}><strong>Action Required:</strong> Within 5 business days, confirm the client received the notice. Read the notice carefully. It will state a response deadline (usually 30 days). If agreement is needed, respond within the deadline. If disagreement, file a protest with the IRS Office of Appeals.</div></div>
              <div className={styles.redFlagCard}><div className={styles.redFlagCode}>502</div><div className={styles.redFlagTitle}>Default Notice (Failure to File)</div><p className={styles.redFlagDesc}>A notice for failure to file a required return was issued.</p><div className={styles.redFlagAction}><strong>Action Required:</strong> File the missing return immediately, even if no tax is due. Penalties will continue to accrue for each year of non-compliance. If returns span multiple years, file all missing years within 60 days.</div></div>
              <div className={styles.redFlagCard}><div className={styles.redFlagCode}>301</div><div className={styles.redFlagTitle}>Penalty Assessed</div><p className={styles.redFlagDesc}>The IRS assessed a penalty (accuracy-related, fraud, failure-to-pay, etc).</p><div className={styles.redFlagAction}><strong>Action Required:</strong> Identify the penalty type from the notice. If a mistake, request relief based on reasonable cause. If accuracy penalty, review the return to ensure proper substantiation. Consider amended return if errors are found.</div></div>
            </section>

            {/* Reference Table */}
            <section className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>Quick Reference Chart</h2>
              <p className={styles.sectionIntro}>Fast lookup for common codes. Print this page and keep it at your desk.</p>
              <table className={styles.referenceTable}>
                <thead><tr><th>Code</th><th>Meaning</th><th>Risk Level</th><th>Typical Action</th></tr></thead>
                <tbody>
                  <tr><td><strong>150</strong></td><td>Return Received</td><td>Low</td><td>Normal - track processing</td></tr>
                  <tr><td><strong>201</strong></td><td>Tax Adjustment</td><td>Moderate</td><td>Review adjustment reason</td></tr>
                  <tr><td><strong>290</strong></td><td>Relief from Liability</td><td>Low</td><td>Confirm relief program</td></tr>
                  <tr><td><strong>340</strong></td><td>Claim Recorded</td><td>Moderate</td><td>Monitor for processing</td></tr>
                  <tr><td><strong>420</strong></td><td>Statute Closing</td><td>Low</td><td>Verify all issues resolved</td></tr>
                  <tr><td><strong>501</strong></td><td>Reversal</td><td>Moderate</td><td>Understand reason</td></tr>
                  <tr><td><strong>520</strong></td><td>Notice Issued</td><td>Immediate</td><td>Confirm receipt - read carefully</td></tr>
                  <tr><td><strong>570</strong></td><td>Refund Hold/Offset</td><td>Immediate</td><td>Determine offset reason - ACT FAST</td></tr>
                  <tr><td><strong>610</strong></td><td>Lien Filed</td><td>Immediate</td><td>Contact IRS Collection - get plan</td></tr>
                  <tr><td><strong>622</strong></td><td>Levy Released</td><td>Low</td><td>Confirm with employer/bank</td></tr>
                  <tr><td><strong>650</strong></td><td>Installment Plan</td><td>Moderate</td><td>Ensure payments stay current</td></tr>
                  <tr><td><strong>671</strong></td><td>Estimated Tax Payment</td><td>Low</td><td>Verify correct quarter/year</td></tr>
                  <tr><td><strong>768</strong></td><td>Refund Pending</td><td>Low</td><td>Wait - normal processing</td></tr>
                  <tr><td><strong>772</strong></td><td>Refund Accepted</td><td>Low</td><td>Track status - good sign</td></tr>
                  <tr><td><strong>806</strong></td><td>Payment Received</td><td>Low</td><td>Verify amount posted correctly</td></tr>
                  <tr><td><strong>846</strong></td><td>Refund Issued</td><td>Low</td><td>Confirm arrival with client</td></tr>
                  <tr><td><strong>890</strong></td><td>Refund Funded</td><td>Low</td><td>Track delivery - should arrive soon</td></tr>
                  <tr><td><strong>971</strong></td><td>Correspondence Item</td><td>Immediate</td><td>Verify client received notice</td></tr>
                </tbody>
              </table>
            </section>

            {/* Key Takeaways */}
            <section className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>Key Takeaways</h2>
              <div className={styles.goldenRule}><h3 className={styles.goldenRuleTitle}>The Golden Rule</h3><p className={styles.goldenRuleText}>Always flag codes 520, 570, 610, and 971. These codes indicate unresolved issues that require immediate action. A few hours of attention now prevents days or weeks of problems later.</p></div>
              <div className={styles.takeawayGrid}>
                <div className={styles.takeawayBox}><h4 className={styles.takeawayBoxTitle}>What Codes Tell You</h4><ul className={styles.takeawayList}><li>What the IRS did to the account</li><li>When they did it</li><li>What status the return is in</li><li>Whether action is needed</li></ul></div>
                <div className={styles.takeawayBox}><h4 className={styles.takeawayBoxTitle}>What Codes Don't Tell You</h4><ul className={styles.takeawayList}><li>Specific dollar amounts (see the detail columns)</li><li>The exact reason for an action</li><li>Which form was filed (check the return type)</li><li>What notice was mailed (check the notice description)</li></ul></div>
              </div>
              <div className={styles.proTip}><h3 className={styles.proTipTitle}>Pro Tip: Always Cross-Reference</h3><p className={styles.proTipText}>Transcript codes work in sequences. A 520 (Notice Issued) + 971 (Correspondence Item) together means a notice was mailed. A 150 (Return Received) + 201 (Tax Adjustment) means the return was accepted but changed. Learn to read these sequences as a story, not individual events.</p></div>
            </section>

            {/* Content Footer */}
            <div className={styles.footerSection}>
              <div className={styles.footerDisclaimer}><strong>Professional Disclaimer:</strong> This guide is for educational purposes and compiled from IRS publications and tax professional experience. Codes are subject to change and new codes are added periodically. Always verify interpretations against the most current IRS documentation and Form 4506-C transcripts. For specific tax or collection issues, consult with a tax professional or attorney. This guide does not constitute tax, legal, or professional advice.</div>
              <div className={styles.footerContact}><span suppressHydrationWarning>© {new Date().getFullYear()}</span> Transcript.Tax Monitor Pro<span className={styles.footerSep}>•</span><Link href="/legal/privacy" className={styles.footerLink}>Privacy</Link><span className={styles.footerSep}>•</span><Link href="/legal/terms" className={styles.footerLink}>Terms</Link></div>
            </div>

          </div>
        </div>
      </main>

      {/* Site Footer */}
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <p className={styles.siteFooterCopy} suppressHydrationWarning>© {new Date().getFullYear()} Transcript.Tax Monitor Pro. All rights reserved.</p>
          <div className={styles.siteFooterLinks}>
            <Link href="/legal/privacy" className={styles.siteFooterLink}>Privacy Policy</Link>
            <Link href="/legal/terms" className={styles.siteFooterLink}>Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
