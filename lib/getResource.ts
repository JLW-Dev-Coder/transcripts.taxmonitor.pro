import fs from 'fs'
import path from 'path'
import type { Resource } from './types'

export function getResource(slug: string): Resource | null {
  const file = path.join(process.cwd(), 'content', 'resources', `${slug}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Resource
}
