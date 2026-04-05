import styles from './TaxpayerCTA.module.css'

export default function TaxpayerCTA() {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Need help with your IRS transcript?</h2>
      <p className={styles.body}>
        Understanding IRS codes is just the first step. If you need professional
        help resolving a tax issue, our directory connects you with verified tax
        professionals — CPAs, Enrolled Agents, and tax attorneys — who specialize
        in exactly this.
      </p>
      <a
        href="https://taxmonitor.pro/directory"
        className={styles.btn}
      >
        Find a tax professional
      </a>
      <a
        href="https://transcript.taxmonitor.pro/tools/code-lookup"
        className={styles.secondary}
      >
        Or try our free IRS code lookup tool
      </a>
    </div>
  )
}
