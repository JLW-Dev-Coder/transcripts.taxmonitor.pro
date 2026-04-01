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
  const categoryLabel = resource.category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <span className={styles.category}>{categoryLabel}</span>
        <h1 className={styles.title}>{resource.title}</h1>
        {resource.description && (
          <p className={styles.description}>{resource.description}</p>
        )}
        <CTA type={resource.cta} variant="inline" />
        <div className={styles.content}>{children}</div>
        <CTA type={resource.cta} variant="post-content" />
      </main>
      <Sidebar resource={resource} />
    </div>
  )
}
