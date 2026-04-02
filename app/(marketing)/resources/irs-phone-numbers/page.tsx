import type { Metadata } from 'next'
import IrsPhoneClient from './IrsPhoneClient'

export const metadata: Metadata = {
  title: 'IRS Department Phone Numbers | Transcript Tax Monitor Pro',
  description: 'A searchable directory of IRS department phone numbers for tax professionals. Find the right IRS office for transcripts, appeals, and collections.',
}

export default function IrsPhoneNumbersPage() {
  return <IrsPhoneClient />
}
