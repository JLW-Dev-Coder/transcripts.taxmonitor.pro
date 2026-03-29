'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => resolve()
    document.head.appendChild(el)
  })
}

export default function ParserSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      loadScript('/_sdk/element_sdk.js'),
      loadScript('/_sdk/data_sdk.js'),
    ]).then(() => setLoaded(true))
  }, [])

  return (
    <div className={styles.parserWrapper}>
      {!loaded && (
        <div className={styles.parserLoading}>
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.parserLoadingText}>Loading parser…</p>
        </div>
      )}
      <div id="parser-preview-root" className={styles.parserRoot} />
    </div>
  )
}
