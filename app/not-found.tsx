import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Transcript Tax Monitor Pro',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <p className={styles.code}>404</p>
        <h1 className={styles.headline}>Page not found</h1>
        <p className={styles.body}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <p className={styles.hint}>
          Looking for a page that used to end in <code>.html</code>? Try removing the{' '}
          <code>.html</code> from the URL.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            Go Home
          </Link>
          <Link href="/resources/irs-code-150-meaning" className={styles.btnSecondary}>
            Browse Resources
          </Link>
        </div>
      </div>
    </main>
  );
}
