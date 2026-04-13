'use client'

import { useState } from 'react'
import ContentCard from '@/components/member/ContentCard'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [contactPref, setContactPref] = useState('email')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your personal information and preferences</p>
      </div>

      <ContentCard title="Personal Information">
        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          {/* Avatar */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-300">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg font-bold text-slate-400">
                {name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-slate-400 transition hover:border-teal-500/30 hover:text-teal-400"
              >
                Upload photo
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-[13px] font-medium text-slate-300">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-teal-500/40 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-[13px] font-medium text-slate-300">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-teal-500/40 focus:outline-none"
            />
          </div>

          {/* Contact preference */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-300">Contact preference</label>
            <div className="flex gap-4">
              {['email', 'phone', 'none'].map(pref => (
                <label key={pref} className="flex items-center gap-2 text-[13px] text-slate-400">
                  <input
                    type="radio"
                    name="contact-pref"
                    value={pref}
                    checked={contactPref === pref}
                    onChange={() => setContactPref(pref)}
                    className="accent-teal-500"
                  />
                  {pref.charAt(0).toUpperCase() + pref.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            Save changes
          </button>
        </form>
      </ContentCard>
    </div>
  )
}
