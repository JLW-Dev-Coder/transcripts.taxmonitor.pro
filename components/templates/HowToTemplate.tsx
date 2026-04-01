import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function HowToTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
      <h2>Automate This Process</h2>
      <p>
        Instead of following these steps manually for every client, use the
        Transcript Tax Monitor Pro parser to handle transcript interpretation
        automatically. Upload a PDF and get a complete plain-English report
        — including every transaction code explained — in under 10 seconds.
      </p>
    </ResourceLayout>
  )
}
