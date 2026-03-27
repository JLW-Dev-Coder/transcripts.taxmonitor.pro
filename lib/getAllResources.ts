import fs from 'fs'
import path from 'path'
import type { Resource } from './types'

export function getAllResources(): Resource[] {
  const dir = path.join(process.cwd(), 'content', 'resources')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as Resource)
}
