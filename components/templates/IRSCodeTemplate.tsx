import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

function extractCodeNumber(slug: string): string {
  const match = slug.match(/irs-code-(\d+[a-zA-Z]?)-meaning/)
  return match ? match[1].toUpperCase() : ''
}

const CODE_DEFINITIONS: Record<string, { plain: string; combinations: string[]; workflow: string[]; faqs: Array<{q:string;a:string}>; clientScript: string }> = {
  '150': {
    plain: 'Your tax return has been received and processed by the IRS. The amount shown is your assessed tax liability for the year.',
    combinations: ['150 + 806 — Return filed with withholding credit applied', '150 + 766 — Return filed with additional credit (child tax credit, etc.)', '150 + 846 — Return filed and refund issued', '150 + 570 — Return filed but refund is on hold'],
    workflow: ['Confirm the 150 date matches the return filing date', 'Compare the 150 amount to the client\'s filed return liability', 'Check for a matching 806 code — this shows withholding credit', 'If 150 amount differs from filed return, flag for discrepancy review', 'Look downstream for 846 (refund) or 570 (hold) to determine outcome'],
    faqs: [
      { q: 'What does the dollar amount next to code 150 mean?', a: 'It represents the total tax liability as assessed by the IRS from the filed return. This is the baseline before credits and payments are applied.' },
      { q: 'Is code 150 good or bad?', a: 'Code 150 is neutral — it simply confirms the IRS received and processed the return. By itself it indicates no problem.' },
      { q: 'Why does my client\'s 150 amount differ from their filed return?', a: 'The IRS may have made adjustments during processing. Compare the 150 amount against the original return and look for additional codes that explain any changes.' },
      { q: 'What codes typically follow 150?', a: 'Code 806 (withholding credit), 766 (other credits), and either 846 (refund issued) or 570 (hold placed) are the most common follow-on codes.' },
    ],
    clientScript: '"Your transcript shows code 150, which means the IRS has processed your return and established your tax liability at [amount]. This is the starting point — from here we look at credits and payments to see what you\'re owed or what you owe."',
  },
  '570': {
    plain: 'The IRS has placed a hold on your account. This prevents a refund from being issued until the hold is resolved. It does not mean you are being audited.',
    combinations: ['570 + 971 — Hold placed and notice sent to taxpayer', '570 + 810 — Double hold (refund freeze plus processing hold)', '570 + 571 — Hold released (resolution)', '570 alone — Hold pending, no notice yet issued'],
    workflow: ['Note the date of the 570 code', 'Check if a 971 code follows — this means a notice was sent', 'Identify the notice type from the 971 description', 'If no 971 follows within 4-6 weeks, call IRS for hold reason', 'Document hold reason and advise client on response timeline', 'Watch for 571 (hold released) or 810 (freeze added)'],
    faqs: [
      { q: 'Does code 570 mean my client is being audited?', a: 'No. Code 570 is a processing hold, not an audit flag. Common causes include identity verification, math errors, or income matching issues.' },
      { q: 'How long does a 570 hold last?', a: 'Holds typically resolve within 6-8 weeks if no action is required. If a notice was sent (971 code), the hold lasts until the client responds.' },
      { q: 'What\'s the difference between 570 and 810?', a: 'Code 570 is a soft hold on refund issuance. Code 810 is a harder refund freeze, often related to fraud detection or examination.' },
      { q: 'Should I call the IRS about a 570 hold?', a: 'If no 971 notice code appears within 4-6 weeks of the 570, calling the IRS Practitioner Priority Line can help identify the hold reason faster.' },
    ],
    clientScript: '"Your transcript shows a code 570, which is a processing hold. This is not an audit — it means the IRS paused your refund while they verify something. We\'re monitoring this and will advise you when it resolves or if you need to take action."',
  },
  '846': {
    plain: 'The IRS has approved and issued your refund. The date shown is the scheduled refund deposit or mailing date.',
    combinations: ['846 after 150 + 806 — Standard refund sequence', '846 after 571 — Refund issued after hold released', '846 with future date — Refund scheduled but not yet sent'],
    workflow: ['Confirm 846 date against client\'s expected refund date', 'Verify refund amount matches expected calculation', 'If amount differs, look for offset codes (898) or adjustment codes', 'If date has passed with no refund received, initiate refund trace'],
    faqs: [
      { q: 'What does the date next to 846 mean?', a: 'It is the date the IRS scheduled the refund. Direct deposits typically arrive 1-3 business days after this date. Paper checks take 3-4 weeks.' },
      { q: 'Why is the 846 amount less than expected?', a: 'Look for code 898 (refund applied to debt) or other adjustment codes. The IRS may have offset part of the refund against a prior balance.' },
      { q: 'My client has a 846 but still hasn\'t received the refund — what do I do?', a: 'If more than 5 business days have passed for direct deposit (or 4 weeks for a check), file a refund trace using Form 3911.' },
    ],
    clientScript: '"Good news — your transcript shows code 846, which means the IRS has approved and issued your refund. The date shown is [date]. You should receive it within a few business days if it\'s a direct deposit."',
  },
  '971': {
    plain: 'The IRS has issued a notice or letter to the taxpayer. The description field indicates the type of notice sent.',
    combinations: ['971 after 570 — Notice sent explaining the hold', '971 + 977 — Amended return notice', '971 alone — Informational notice with no hold'],
    workflow: ['Identify the notice type from the 971 description', 'Obtain a copy of the notice from the client', 'Cross-reference with any 570 or 810 hold codes', 'Determine response deadline from the notice', 'Prepare response or documentation as needed'],
    faqs: [
      { q: 'What kind of notice does code 971 indicate?', a: 'It varies. Common notices include CP05 (identity verification), CP2000 (income mismatch), and CP12 (math error correction). The description field on the transcript line identifies the specific notice type.' },
      { q: 'Is code 971 serious?', a: 'It depends on the notice type. Many 971 codes are informational. Others require a response within 30-60 days to avoid additional action.' },
      { q: 'My client never received the notice — what now?', a: 'Request a copy using IRS Form 4506-T or call the IRS directly. You can also request the notice through your e-services account.' },
    ],
    clientScript: '"Your transcript shows a code 971, which means the IRS sent you a notice. The type of notice is [type]. We need to review this notice and determine if any action is required on your part."',
  },
  '806': {
    plain: 'This code reflects the federal income tax withheld from W-2s and 1099s that has been credited to the taxpayer\'s account.',
    combinations: ['806 after 150 — Standard: return processed with withholding applied', '806 + 766 — Withholding plus additional credits', '806 alone without 150 — Withholding posted before return processed'],
    workflow: ['Verify 806 amount matches total withholding on all W-2s and 1099s', 'If amounts differ, request wage and income transcript for comparison', 'Large discrepancies may indicate unreported income or employer reporting errors'],
    faqs: [
      { q: 'Why does my client\'s 806 amount not match their W-2?', a: 'The 806 amount reflects what employers and payers reported to the IRS — not necessarily what\'s on the client\'s copy. Request a Wage and Income transcript to compare.' },
      { q: 'Can the 806 amount be wrong?', a: 'Yes. Employer reporting errors can cause mismatches. These need to be resolved before the return is processed correctly.' },
    ],
    clientScript: '"Code 806 on your transcript shows the total federal tax withheld from your paychecks and 1099 income — [amount]. This is what the IRS has on file as already paid toward your tax bill."',
  },
}

function getCodeData(code: string) {
  return CODE_DEFINITIONS[code] || {
    plain: `IRS transaction code ${code} represents a specific action or status posted to a taxpayer's IRS account transcript. Tax professionals use this code to track IRS processing activity and advise clients accordingly.`,
    combinations: [
      `Code ${code} with 150 — Combined with return filing`,
      `Code ${code} with 971 — Notice issued related to this action`,
      `Code ${code} with 570 — Action combined with processing hold`,
    ],
    workflow: [
      `Note the date and amount associated with code ${code}`,
      `Cross-reference with surrounding codes to understand context`,
      `Determine if any client action or IRS response is required`,
      `Document findings and advise client on next steps`,
      `Monitor the account for follow-on codes over the next 4-8 weeks`,
    ],
    faqs: [
      { q: `What does IRS code ${code} mean on a transcript?`, a: `Code ${code} represents a specific IRS processing action. The exact meaning depends on the context of surrounding codes, the associated date, and the dollar amount shown.` },
      { q: `Is code ${code} a problem?`, a: `Not necessarily. Most transcript codes are routine processing actions. Review the full transcript context — particularly any hold codes (570, 810) or notice codes (971) — to determine if action is needed.` },
      { q: `What should I tell my client about code ${code}?`, a: `Explain that code ${code} represents a specific IRS action on their account. Use the transcript parser to generate a plain-English report you can share directly with your client.` },
      { q: `What codes commonly appear with code ${code}?`, a: `Cross-reference with codes 150 (return filed), 806 (withholding), 570 (hold), 971 (notice), and 846 (refund) to build a complete picture of the account status.` },
    ],
    clientScript: `"Your transcript shows code ${code}, which indicates a specific action the IRS has taken on your account. We are reviewing what this means for your situation and will advise you on any steps needed."`,
  }
}

export default function IRSCodeTemplate({ data }: { data: Resource }) {
  const code = extractCodeNumber(data.slug)
  const codeData = getCodeData(code)

  return (
    <ResourceLayout resource={data}>
      {data.content && (
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      )}

      <h2>What Code {code} Means in Plain English</h2>
      <p>{codeData.plain}</p>

      <h2>Common Code Combinations with Code {code}</h2>
      <p>IRS codes rarely appear alone. Here are the most common combinations involving code {code} and what they mean together:</p>
      <ul>
        {codeData.combinations.map((c, i) => (
          <li key={i}><strong>{c.split('—')[0].trim()}</strong>{c.includes('—') ? ` — ${c.split('—')[1].trim()}` : ''}</li>
        ))}
      </ul>

      <h2>Practitioner Workflow for Code {code}</h2>
      <p>When you see code {code} on a client transcript, follow this workflow:</p>
      <ol>
        {codeData.workflow.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <h2>Frequently Asked Questions</h2>
      {codeData.faqs.map((faq, i) => (
        <div key={i}>
          <h3>{faq.q}</h3>
          <p>{faq.a}</p>
        </div>
      ))}

      <h2>Client Script for Code {code}</h2>
      <p>Use this plain-English explanation when discussing code {code} with your client:</p>
      <blockquote style={{ borderLeft: '3px solid #14b8a6', paddingLeft: '1rem', margin: '1rem 0', fontStyle: 'italic', color: 'var(--text-muted)' }}>
        {codeData.clientScript}
      </blockquote>

      <h2>Automate Code {code} Interpretation</h2>
      <p>
        Instead of manually researching code {code} for every client, use the Transcript Tax Monitor Pro parser.
        Upload the full transcript PDF and get a complete plain-English report — including code {code} and every
        other code on the transcript — in under 10 seconds. Generate branded reports you can share directly with clients.
      </p>
    </ResourceLayout>
  )
}
