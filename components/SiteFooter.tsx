import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.35fr_1fr_1fr_1fr] md:items-start md:gap-x-16">
          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 font-bold text-slate-950 text-sm">
                TT
              </div>
              <span className="font-semibold tracking-tight text-white">
                Transcript Tax Monitor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transcript automation for tax professionals
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              Upload a client&apos;s IRS transcript PDF and get a plain-English
              analysis report in seconds — with every transaction code explained
              and recommendations included.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Try Free →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-800/70 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Column 2 — Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-sm text-slate-300 transition hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-300 transition hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm text-slate-300 transition hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-slate-300 transition hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-300 transition hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-slate-300 transition hover:text-white">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/affiliates" className="text-sm text-slate-300 transition hover:text-white">
                  Affiliates
                </Link>
              </li>
              <li>
                <a href="https://developers.virtuallaunch.pro" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 transition hover:text-white">
                  Developers VLP
                </a>
              </li>
              <li>
                <a href="https://games.virtuallaunch.pro" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 transition hover:text-white">
                  Games VLP
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-300 transition hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <a href="https://taxmonitor.pro" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 transition hover:text-white">
                  Tax Monitor Pro
                </a>
              </li>
              <li>
                <a href="https://taxtools.taxmonitor.pro" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 transition hover:text-white">
                  Tax Tools Arcade
                </a>
              </li>
              <li>
                <a href="https://virtuallaunch.pro" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 transition hover:text-white">
                  Virtual Launch Pro
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-sm text-slate-300 transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className="text-sm text-slate-300 transition hover:text-white">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-slate-300 transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <p className="text-xs text-slate-500 mt-4">
              &copy; 2026 Lenore, Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/60 mt-10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              &copy; 2026 Lenore, Inc.
            </p>
            <p className="text-sm text-slate-500">
              Earn 20% on every referral &mdash;{" "}
              <Link href="/affiliates" className="text-sm text-teal-400 hover:text-teal-300">
                Join the Affiliate Program
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
