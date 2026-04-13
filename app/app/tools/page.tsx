'use client'

import Link from 'next/link'
import { Search, Magnet, ShieldCheck } from 'lucide-react'
import ContentCard from '@/components/member/ContentCard'
import TranscriptParser from '@/components/member/TranscriptParser'

const tools = [
  {
    title: 'IRS Code Lookup',
    description: 'Instantly decode any IRS transcript code with plain-English explanations.',
    href: '/tools/code-lookup',
    icon: Search,
  },
  {
    title: 'Lead Magnet',
    description: 'Generate a free practice analysis to share with prospects.',
    href: '/tools/code-lookup',
    icon: Magnet,
  },
  {
    title: 'Section 7216 Guide',
    description: 'Interactive reference for IRS Section 7216 disclosure requirements.',
    href: '/tools/code-lookup',
    icon: ShieldCheck,
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tools</h1>
        <p className="mt-1 text-sm text-white/60">Parse transcripts and access free tax professional resources</p>
      </div>

      {/* Transcript Parser — primary tool */}
      <TranscriptParser />

      {/* Additional tools */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/60 uppercase tracking-widest">More Resources</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(tool => {
            const Icon = tool.icon
            return (
              <ContentCard key={tool.title}>
                <div className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
                    <Icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/90">{tool.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/60">{tool.description}</p>
                  <Link
                    href={tool.href}
                    className="mt-1 text-[13px] font-medium text-teal-400 hover:text-teal-300"
                  >
                    Open tool &rarr;
                  </Link>
                </div>
              </ContentCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
