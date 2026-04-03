import { execSync } from 'child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

console.log('Building with OpenNext...')
execSync('npx @opennextjs/cloudflare build', { stdio: 'inherit' })

const src = '.open-next/worker.js'
const dest = '.open-next/assets/_worker.js'

if (!existsSync(src)) {
  console.error('ERROR: .open-next/worker.js not found after build')
  process.exit(1)
}

// Copy worker entry point
copyFileSync(src, dest)
console.log('Copied worker.js to assets/_worker.js')

// Copy all directories that _worker.js imports from
const dirs = ['cloudflare', 'middleware', '.build', 'server-functions']
for (const dir of dirs) {
  const srcDir = join('.open-next', dir)
  const destDir = join('.open-next', 'assets', dir)
  if (existsSync(srcDir)) {
    cpSync(srcDir, destDir, { recursive: true })
    console.log(`Copied ${srcDir} to ${destDir}`)
  } else {
    console.warn(`WARNING: ${srcDir} not found, skipping`)
  }
}

console.log('Build complete.')
