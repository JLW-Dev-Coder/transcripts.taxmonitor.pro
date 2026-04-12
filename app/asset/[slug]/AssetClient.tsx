'use client'

import { useEffect, useState } from 'react'
import styles from './AssetClient.module.css'

interface Props {
  slug: string
}

declare global {
  interface Window {
    Cal?: any
  }
}

const CODE_LABELS: Record<string, string> = {
  '971': 'Notice issued',
  '846': 'Refund issued',
  '570': 'Additional account action pending',
}

const PRESETS = [
  { c: 10, m: 20, f: 125, w: 52, label: 'Light transcript load — 10 clients/week' },
  { c: 20, m: 20, f: 150, w: 52, label: 'Steady load — 20 clients/week' },
  { c: 35, m: 25, f: 175, w: 52, label: 'Heavy resolution load — 35 clients/week' },
]

const SKIP_TITLE_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor',
  'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet',
])

function titleCase(str: string | undefined | null): string {
  if (!str) return ''
  return str.toLowerCase().replace(/[^\s&]+/g, (w, i) => {
    if (i > 0 && SKIP_TITLE_WORDS.has(w)) return w
    return w.charAt(0).toUpperCase() + w.slice(1)
  })
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: n % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

const GAP_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M8 6.75h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 11.75h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16.75h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 5.25v6.25l4.25 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7.5 8.25h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.75 17.25l-3.5 2v-3.75a5.75 5.75 0 0 1-3-5 5.75 5.75 0 0 1 5.75-5.75h6a5.75 5.75 0 0 1 5.75 5.75 5.75 5.75 0 0 1-5.75 5.75H9.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.9" />
    </svg>
  ),
]

export default function AssetPageClient({ slug }: Props) {
  const [d, setD] = useState<any>(null)
  const [error, setError] = useState(false)

  const [clients, setClients] = useState(20)
  const [minutes, setMinutes] = useState(20)
  const [fee, setFee] = useState(150)
  const [weeks, setWeeks] = useState(52)
  const [isToolMode, setIsToolMode] = useState(false)
  const [prevMin, setPrevMin] = useState(20)

  useEffect(() => {
    fetch(`https://api.taxmonitor.pro/v1/scale/asset/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(data => {
        setD(data)
        const wkHrs = parseFloat(data.time_savings_weekly) || 6.7
        if (wkHrs > 0) {
          setClients(Math.round((wkHrs * 60) / 20))
        }
      })
      .catch(() => setError(true))
  }, [slug])

  useEffect(() => {
    if (typeof window === 'undefined' || window.Cal) return
    const script = document.createElement('script')
    script.text = `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "transcript-tax-monitor-pro-intro", {origin:"https://app.cal.com"});
Cal.ns["transcript-tax-monitor-pro-intro"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#292929"},"dark":{"cal-brand":"#14b8a6"}},"hideEventTypeDetails":false,"layout":"month_view"});
`
    document.head.appendChild(script)
  }, [])

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorPage}>
          <div>
            <h1 className={styles.errorTitle}>Page not found</h1>
            <p className={styles.errorBody}>This asset page does not exist or has been removed.</p>
            <a href="https://transcript.taxmonitor.pro" className={styles.errorLink}>
              Go to Transcript Tax Monitor Pro
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!d) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>
          <div>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading practice asset...</p>
          </div>
        </div>
      </div>
    )
  }

  const firm = titleCase(d.firm) || 'Tax Professional'

  const c = Number(clients) || 0
  const m = Number(minutes) || 0
  const f = Number(fee) || 0
  const w = Number(weeks) || 0

  type Metric = { label: string; value: string; unit: string; gold: boolean }
  type Formula = { label: string; value: string; formula: string; gold: boolean }
  let metrics: Metric[]
  let formulas: Formula[]

  if (!isToolMode) {
    const wh = (c * m) / 60
    const ah = wh * w
    const wr = c * f
    const ar = wr * w
    metrics = [
      { label: 'Time spent weekly', value: fmt(wh), unit: 'hrs/week', gold: false },
      { label: 'Time spent annually', value: fmt(ah), unit: 'hrs/year', gold: false },
      { label: 'Current weekly revenue', value: fmtUSD(wr), unit: '/week', gold: false },
      { label: 'Current annual revenue', value: fmtUSD(ar), unit: '/year', gold: false },
    ]
    formulas = [
      { label: 'Weekly hours', value: fmt(wh), formula: 'clients × minutes ÷ 60', gold: false },
      { label: 'Annual hours', value: fmt(ah), formula: 'weekly hours × weeks', gold: false },
      { label: 'Weekly revenue', value: fmtUSD(wr), formula: 'clients × flat fee', gold: false },
      { label: 'Annual revenue', value: fmtUSD(ar), formula: 'weekly revenue × weeks', gold: false },
    ]
  } else {
    const origMin = prevMin
    const toolMin = 1
    const recoveredHrsWk = (c * (origMin - toolMin)) / 60
    const newClients = Math.floor((recoveredHrsWk * 60) / origMin)
    const addRevWk = newClients * f
    const addRevYr = addRevWk * w
    metrics = [
      { label: 'Time recovered weekly', value: fmt(recoveredHrsWk), unit: 'hrs back', gold: true },
      { label: 'Additional clients possible', value: '+' + newClients, unit: 'clients/week', gold: true },
      { label: 'Additional weekly revenue', value: '+' + fmtUSD(addRevWk), unit: '/week', gold: true },
      { label: 'Additional annual revenue', value: '+' + fmtUSD(addRevYr), unit: '/year', gold: true },
    ]
    formulas = [
      { label: 'Recovered hours', value: fmt(recoveredHrsWk), formula: `clients × (${origMin}min − 1min) ÷ 60`, gold: true },
      { label: 'New clients', value: '+' + newClients, formula: `recovered hrs × 60 ÷ ${origMin}min`, gold: true },
      { label: 'Added weekly rev', value: '+' + fmtUSD(addRevWk), formula: 'new clients × flat fee', gold: true },
      { label: 'Added annual rev', value: '+' + fmtUSD(addRevYr), formula: 'weekly × weeks', gold: true },
    ]
  }

  function selectNowMode() {
    setIsToolMode(false)
    setMinutes(prevMin)
  }

  function selectToolMode() {
    setPrevMin(minutes)
    setIsToolMode(true)
    setMinutes(1)
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setClients(p.c)
    setFee(p.f)
    setWeeks(p.w)
    if (!isToolMode) setMinutes(p.m)
    setPrevMin(p.m)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <header className={`${styles.header} ${styles.animated}`}>
          <div className={styles.headerBrand}>
            <div className={styles.headerDot} />
            <span className={styles.headerName}>Transcript Tax Monitor Pro</span>
          </div>
          <span className={styles.headerDomain}>transcript.taxmonitor.pro</span>
        </header>

        <section className={`${styles.glass} ${styles.heroSection} ${styles.animated} ${styles.d1}`}>
          <div className={styles.chip}>Practice Asset — {firm}</div>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.headline}>{d.headline}</h1>
              <p className={styles.subheadline}>{d.subheadline}</p>
              <div className={`${styles.glass} ${styles.calcCard}`}>
                <div className={styles.sectionLabel}>Interactive estimate</div>
                <div className={styles.inputGroup}>
                  <div>
                    <label className={styles.inputLabel}>Transcript clients per week</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      step={1}
                      value={clients}
                      onChange={e => setClients(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Minutes per transcript</label>
                    <div className={styles.modeBtnRow}>
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${!isToolMode ? styles.activeNow : ''}`}
                        onClick={selectNowMode}
                      >
                        Without tool
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${isToolMode ? styles.activeTool : ''}`}
                        onClick={selectToolMode}
                      >
                        With tool
                      </button>
                    </div>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      step={1}
                      value={minutes}
                      readOnly={isToolMode}
                      onChange={e => setMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Estimated flat fee for this service ($)</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      step={1}
                      value={fee}
                      onChange={e => setFee(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className={styles.inputLabel}>Active weeks per year</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      max={52}
                      step={1}
                      value={weeks}
                      onChange={e => setWeeks(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={`${styles.modeBanner} ${isToolMode ? styles.opportunity : styles.pain}`}>
                {isToolMode
                  ? 'Now showing: growth opportunity with the tool'
                  : 'Currently showing: time spent without the tool'}
              </div>
              <div className={styles.metricsStack}>
                {metrics.map((mt, i) => (
                  <div key={i} className={`${styles.metricCard} ${mt.gold ? styles.gold : ''}`}>
                    <div className={`${styles.metricLabel} ${mt.gold ? styles.gold : ''}`}>{mt.label}</div>
                    <div className={styles.metricRow}>
                      <span className={`${styles.metricVal} ${mt.gold ? styles.gold : ''}`}>{mt.value}</span>
                      <span className={styles.metricUnit}>{mt.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`${styles.glass} ${styles.presetCard}`}>
                <div className={styles.sectionLabel}>Preset scenarios</div>
                <div className={styles.presetList}>
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      className={styles.presetBtn}
                      onClick={() => applyPreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.glass} ${styles.formulaSection} ${styles.animated} ${styles.d2}`}>
          <div className={styles.sectionLabel}>How this estimate works</div>
          <p className={styles.formulaCopy}>
            The estimate uses the practice&apos;s own caseload, time per transcript, flat fee per
            transcript service, and active weeks. Toggle &quot;With tool&quot; to see how recovered
            time translates into additional capacity and revenue.
          </p>
          <div className={styles.formulaInner}>
            <div className={styles.formulaTitle}>Formula</div>
            <div className={styles.formulaGrid}>
              {formulas.map((fm, i) => (
                <div key={i} className={`${styles.formulaCard} ${fm.gold ? styles.gold : ''}`}>
                  <div className={styles.formulaLabel}>{fm.label}</div>
                  <div className={`${styles.formulaValue} ${fm.gold ? styles.gold : ''}`}>{fm.value}</div>
                  <div className={styles.formulaFormulaLine}>{fm.formula}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formulaFooter}>
            Faster transcript reporting protects margin on flat-fee work and increases how much
            transcript volume the practice can handle. The &quot;With tool&quot; view shows the
            additional clients and revenue that recovered time makes possible.
          </div>
        </section>

        <section className={`${styles.glass} ${styles.gapsSection} ${styles.animated} ${styles.d3}`}>
          <div className={styles.sectionLabel}>What this replaces (in seconds, not hours)</div>
          <div className={styles.gapList}>
            {(d.workflow_gaps || []).map((gap: string, i: number) => (
              <div key={i} className={styles.gapRow}>
                <div className={styles.gapIcon}>{GAP_ICONS[i] || GAP_ICONS[0]}</div>
                <div className={styles.gapText}>{gap}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.glass} ${styles.codesSection} ${styles.animated} ${styles.d4}`}>
          <div className={styles.sectionLabel}>Codes this tool handles instantly</div>
          <div className={styles.codesGrid}>
            {(d.tool_preview_codes || []).map((code: string) => (
              <div key={code} className={styles.codeCard}>
                <div className={styles.codeNum}>{code}</div>
                <div className={styles.codeLabel}>{CODE_LABELS[code] || ''}</div>
              </div>
            ))}
          </div>
          <div className={styles.ctaStack}>
            <a href={d.cta_pricing_url} className={styles.ctaPrimary}>Add this to my practice</a>
            <a
              data-cal-link="tax-monitor-pro/transcript-tax-monitor-pro-intro"
              data-cal-namespace="transcript-tax-monitor-pro-intro"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
              className={styles.ctaSecondary}
            >
              Talk about my caseload — book 15 min
            </a>
            <a href={d.cta_learn_more_url} className={styles.ctaGhost}>Learn more about the tool</a>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Prepared for {firm} · {d.city}, {d.state}</span>
          <span>transcript.taxmonitor.pro</span>
        </footer>
      </div>
    </div>
  )
}
