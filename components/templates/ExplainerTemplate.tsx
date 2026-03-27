import type { Resource } from '@/lib/types'
import ResourceLayout from '../ResourceLayout'

export default function ExplainerTemplate({ data }: { data: Resource }) {
  return (
    <ResourceLayout resource={data}>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />
    </ResourceLayout>
  )
}
