import type { Resource } from '@/lib/types'
import Sidebar from './Sidebar'
import CTA from './CTA'
import styles from './ResourceLayout.module.css'

export default function ResourceLayout({
  resource,
  children,
}: {
  resource: Resource
  children: React.ReactNode
}) {
  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>{resource.title}</h1>
        <CTA type={resource.cta} variant="inline" />
        <div className={styles.content}>{children}</div>
        <CTA type={resource.cta} variant="post-content" />
      </main>
      <Sidebar resource={resource} />
    </div>
  )
}
