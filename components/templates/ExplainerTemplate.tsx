import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function ExplainerTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
      <h2>Key Takeaways</h2>
      <p>
        Understanding {data.title.toLowerCase()} is essential for tax professionals
        who work with IRS transcripts. Use our parser to apply this knowledge
        directly to your clients&apos; transcripts and generate professional reports instantly.
      </p>
    </ResourceLayout>
  )
}
