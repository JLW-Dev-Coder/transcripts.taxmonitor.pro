import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function HowToTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
    </ResourceLayout>
  )
}
