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
        <p className="mt-1 text-sm text-white/60">Manage your personal information and preferences</p>
      </div>

      <ContentCard title="Personal Information">
        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          {/* Avatar */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-white/70">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[--member-border] bg-[--member-card] text-lg font-bold text-white/60">
                {name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <button
                type="button"
                className="rounded-lg border border-[--member-border] px-3 py-1.5 text-[13px] text-white/60 transition hover:border-teal-500/30 hover:text-teal-400"
              >
                Upload photo
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-[13px] font-medium text-white/70">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-[--member-border] bg-[--member-card] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-teal-500/40 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-[13px] font-medium text-white/70">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[--member-border] bg-[--member-card] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-teal-500/40 focus:outline-none"
            />
          </div>

          {/* Contact preference */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-white/70">Contact preference</label>
            <div className="flex gap-4">
              {['email', 'phone', 'none'].map(pref => (
                <label key={pref} className="flex items-center gap-2 text-[13px] text-white/60">
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
