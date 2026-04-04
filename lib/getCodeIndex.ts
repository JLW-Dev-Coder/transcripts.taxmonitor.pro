import fs from 'fs'
import path from 'path'

export interface CodeEntry {
  code: string
  title: string
  description: string
  slug: string
}

export function getCodeIndex(): CodeEntry[] {
  const dir = path.join(process.cwd(), 'content', 'resources')
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir)
    .filter(f => /^irs-code-\d+-meaning\.json$/.test(f))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
      const match = f.match(/^irs-code-(\d+)-meaning\.json$/)
      return {
        code: match![1],
        title: data.title ?? '',
        description: data.description ?? '',
        slug: data.slug ?? f.replace('.json', ''),
      }
    })
    .sort((a, b) => Number(a.code) - Number(b.code))
}
