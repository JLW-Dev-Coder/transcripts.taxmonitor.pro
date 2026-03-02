import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { walkFiles, readTextSafe, uniq } from './common.mjs';

const root = process.cwd();

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function runBuild() {
  const hasBuildMjs = await exists(path.join(root, 'build.mjs'));
  if (hasBuildMjs) {
    await run('node', ['build.mjs']);
    return { command: 'node build.mjs', outputDir: 'dist' };
  }
  const hasPkg = await exists(path.join(root, 'package.json'));
  if (hasPkg) {
    await run('npm', ['run', 'build']);
    return { command: 'npm run build', outputDir: 'dist' };
  }
  throw new Error('No build.mjs or package.json build script found');
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} failed: ${code}`))));
  });
}

function isLocalRef(target) {
  return target
    && !target.startsWith('http://')
    && !target.startsWith('https://')
    && !target.startsWith('mailto:')
    && !target.startsWith('tel:')
    && !target.startsWith('data:')
    && !target.startsWith('//')
    && !target.startsWith('#')
    && !target.includes('${')
    && target !== 'window.location.href'
    && target !== 'file';
}

const build = await runBuild();
const sourceFiles = await walkFiles(root);
const distFiles = await walkFiles(path.join(root, 'dist'), path.join(root, 'dist'));

const copyDirs = ['_sdk', 'assets', 'legal', 'magnets', 'resources', 'scripts', 'styles'];
const copyFiles = ['_redirects', 'sitemap.xml'];
const expected = [
  ...sourceFiles.filter((f) => /^[^/]+\.html$/.test(f)),
  ...sourceFiles.filter((f) => copyDirs.some((d) => f.startsWith(`${d}/`))),
  ...copyFiles.filter((f) => sourceFiles.includes(f)),
].sort();

const missingInDist = expected.filter((f) => !distFiles.includes(f));
const extraInDist = distFiles.filter((f) => !expected.includes(f));

await writeFile(path.join(root, 'audit/dist-coverage.json'), `${JSON.stringify({ build, totals: { expected: expected.length, dist: distFiles.length }, missingInDist, extraInDist }, null, 2)}\n`);

const refs = JSON.parse(await readFile(path.join(root, 'audit/references.json'), 'utf8'));
const pagesAndScripts = sourceFiles.filter((f) => /\.(html|js|mjs|cjs)$/i.test(f));

const requestTargets = [];
for (const file of pagesAndScripts) {
  const text = await readTextSafe(file);
  if (!text) continue;

  const fetchSimple = /fetch\(\s*['\"]([^'\"]+)['\"](?:\s*,\s*\{([\s\S]{0,200}?)\})?/g;
  let m;
  while ((m = fetchSimple.exec(text)) !== null) {
    const target = m[1];
    const opts = m[2] || '';
    const methodMatch = opts.match(/method\s*:\s*['\"](GET|POST|PUT|PATCH|DELETE)['\"]/i);
    requestTargets.push({ file, via: 'fetch', method: (methodMatch?.[1] || 'GET').toUpperCase(), target });
  }

  const formRe = /<form[^>]*>/gi;
  let fm;
  while ((fm = formRe.exec(text)) !== null) {
    const tag = fm[0];
    const action = (tag.match(/action\s*=\s*['\"]([^'\"]*)['\"]/i) || [,''])[1];
    const method = ((tag.match(/method\s*=\s*['\"]([^'\"]*)['\"]/i) || [,'GET'])[1] || 'GET').toUpperCase();
    requestTargets.push({ file, via: 'form', method, target: action });
  }
}

const workerFile = 'workers/api/src/index.js';
let workerRoutes = [];
if (await exists(path.join(root, workerFile))) {
  const workerText = await readTextSafe(workerFile);
  const routeRegex = /['\"](\/[^'\"]+)['\"]/g;
  const seen = new Set();
  let r;
  while ((r = routeRegex.exec(workerText)) !== null) {
    const route = r[1];
    if (/^\/(api|forms)\//.test(route)) seen.add(route);
  }
  workerRoutes = [...seen].sort();
}

const calledApiPaths = uniq(requestTargets.map((r) => r.target).filter((t) => /^\/(api|forms)\//.test(t))).sort();
const missingRoutes = calledApiPaths.filter((t) => !workerRoutes.includes(t));
const unusedRoutes = workerRoutes.filter((r) => !calledApiPaths.includes(r));
const nonAbsoluteFormActions = requestTargets.filter((r) => r.via === 'form' && r.target && !/^https:\/\/api\.taxmonitor\.pro\/forms\//.test(r.target));

const missingLocalReferences = uniq(refs.references
  .filter((r) => ['href', 'src', 'url', 'form-action'].includes(r.kind) && isLocalRef(r.target))
  .map((r) => ({ ...r, cleanTarget: r.target.split('?')[0].split('#')[0] }))
  .filter((r) => r.cleanTarget)
  .map((r) => {
    const fromDir = path.dirname(r.file);
    let resolved = '';
    if (r.cleanTarget === '/') {
      resolved = 'index.html';
    } else if (r.cleanTarget.startsWith('/')) {
      resolved = r.cleanTarget.replace(/^\//, '');
      if (!path.extname(resolved)) resolved = path.join(resolved, 'index.html');
    } else {
      resolved = path.normalize(path.join(fromDir, r.cleanTarget)).replaceAll('\\', '/');
      if (!path.extname(resolved)) resolved = path.join(resolved, 'index.html').replaceAll('\\', '/');
    }
    return { ...r, resolved };
  })
  .filter((r) => !sourceFiles.includes(r.resolved))
  .map((r) => `${r.target}@@${r.file}`))
  .map((k) => { const [target,file]=k.split('@@'); return { target, file }; });

await writeFile(path.join(root, 'audit/api-coverage.json'), `${JSON.stringify({ totals: { requestTargets: requestTargets.length, workerRoutes: workerRoutes.length }, requestTargets, worker: { file: (await exists(path.join(root, workerFile))) ? workerFile : null, routes: workerRoutes }, mismatches: { pageCallsMissingRoute: missingRoutes, routeUnused: unusedRoutes, nonAbsoluteFormActions, referencedButMissingFiles: missingLocalReferences } }, null, 2)}\n`);

const blockers = [];
for (const m of missingLocalReferences) blockers.push(`Referenced but missing file: ${m.target} (from ${m.file})`);
for (const a of nonAbsoluteFormActions) blockers.push(`Form action must be absolute https://api.taxmonitor.pro/forms/*: "${a.target}" in ${a.file}`);
for (const mr of missingRoutes) blockers.push(`Page calls Worker endpoint that does not exist: ${mr}`);
if (!(await exists(path.join(root, workerFile)))) blockers.push('Worker route file missing: workers/api/src/index.js');

const warnings = [];
if (missingInDist.length) warnings.push(`${missingInDist.length} expected build outputs are missing from dist/`);
if (extraInDist.length) warnings.push(`${extraInDist.length} extra files exist in dist/ beyond expected copy/build set`);
if (!blockers.length) warnings.push('No launch blockers detected from automated ruleset');

const nice = [];
if (unusedRoutes.length) nice.push(`Remove or document ${unusedRoutes.length} unused Worker routes.`);
if (!workerRoutes.length) nice.push('Add explicit Worker route inventory comments/tests for API coverage.');

const fixes = [
  ...blockers.map((b, i) => `${i + 1}. ${b}`),
  `${blockers.length + 1}. Re-run audit scripts after fixes and confirm zero blockers.`,
];

const verify = [
  'node audit/generate-files.mjs',
  'node audit/generate-pages.mjs',
  'node audit/generate-references.mjs',
  'node audit/generate-contracts.mjs',
  'node audit/generate-coverage.mjs',
  'node build.mjs',
].sort();

const report = `# Launch Readiness\n\n## Blockers\n${blockers.length ? blockers.map((b) => `- ${b}`).join('\n') : '- None'}\n\n## Nice-to-have\n${nice.length ? nice.map((n) => `- ${n}`).join('\n') : '- None'}\n\n## Warnings\n${warnings.length ? warnings.map((w) => `- ${w}`).join('\n') : '- None'}\n\n## Exact Fix List (ordered by impact)\n${fixes.map((f) => `- ${f}`).join('\n')}\n\n## Verification Commands (alphabetized)\n${verify.map((v) => `- \`${v}\``).join('\n')}\n`;

await writeFile(path.join(root, 'LAUNCH_READINESS.md'), report);
console.log('Wrote audit/dist-coverage.json, audit/api-coverage.json, and LAUNCH_READINESS.md');
