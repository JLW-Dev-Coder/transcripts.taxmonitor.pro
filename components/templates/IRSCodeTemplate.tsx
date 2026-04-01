import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

function extractCodeNumber(slug: string): string {
  const match = slug.match(/irs-code-(\d+[a-z]?)-meaning/)
  return match ? match[1].toUpperCase() : ''
}

export default function IRSCodeTemplate({ data }: { data: Resource }) {
  const code = extractCodeNumber(data.slug)

  return (
    <ResourceLayout resource={data}>
      {/* Render existing JSON content first */}
      {data.content && (
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      )}

      {/* Structured supplemental content for every IRS code page */}
      <h2>What Does IRS Code {code} Mean?</h2>
      <p>
        IRS transaction code {code} appears on IRS account transcripts and represents
        a specific action or status on a taxpayer&apos;s account. Tax professionals
        use transcript codes to understand the history of IRS processing activity,
        identify potential issues, and advise clients on next steps.
      </p>

      <h2>Where Does Code {code} Appear?</h2>
      <p>
        Code {code} appears on the IRS Account Transcript, which shows a complete
        record of all transactions posted to a taxpayer&apos;s account. Each transaction
        line includes the code, a description, a date, and an amount.
      </p>

      <h2>What Should You Do When You See Code {code}?</h2>
      <p>
        When you see IRS Code {code} on a client&apos;s transcript, review the date
        and amount associated with the code. Cross-reference with other codes on
        the transcript to build a complete picture of the account status. If the
        code indicates a hold, freeze, or examination, contact the IRS directly
        or advise your client on the appropriate next steps.
      </p>

      <h2>Reading This Code in Context</h2>
      <p>
        No transcript code should be read in isolation. IRS Code {code} must be
        read alongside the surrounding transaction codes, dates, and amounts.
        Use our transcript parser to upload the full transcript and get a
        plain-English analysis of every code — including code {code} — in seconds.
      </p>

      <h2>For Tax Professionals</h2>
      <p>
        If you work with IRS transcripts regularly, our parser automates the
        interpretation of every transaction code including code {code}. Upload
        a PDF transcript and receive a branded, plain-English report you can
        share directly with your client.
      </p>
    </ResourceLayout>
  )
}
