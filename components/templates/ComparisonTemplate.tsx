import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function ComparisonTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
      <h2>Bottom Line</h2>
      <p>
        Choosing the right tool for IRS transcript analysis directly impacts how
        efficiently your practice handles client inquiries. Transcript Tax Monitor Pro
        is purpose-built for this workflow — upload a transcript and get a
        plain-English report in seconds, with no subscription required.
      </p>
    </ResourceLayout>
  )
}
