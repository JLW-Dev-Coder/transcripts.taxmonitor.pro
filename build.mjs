import { execSync } from 'child_process'
import { copyFileSync, existsSync } from 'fs'

console.log('Building with OpenNext...')
execSync('npx @opennextjs/cloudflare build', { stdio: 'inherit' })

const src = '.open-next/worker.js'
const dest = '.open-next/assets/_worker.js'

if (!existsSync(src)) {
  console.error('ERROR: .open-next/worker.js not found after build')
  process.exit(1)
}

copyFileSync(src, dest)
console.log('Copied worker.js to assets/_worker.js')
