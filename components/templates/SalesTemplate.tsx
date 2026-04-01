import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function SalesTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
      <h2>Ready to Get Started?</h2>
      <p>
        Transcript Tax Monitor Pro is built for tax professionals who want to
        deliver faster, clearer transcript analysis to their clients. No subscription
        required — purchase credits once and use them when you need them.
      </p>
    </ResourceLayout>
  )
}
