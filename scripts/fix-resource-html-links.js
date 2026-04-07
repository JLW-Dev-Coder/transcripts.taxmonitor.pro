// One-shot script: rewrite `.html` resource links → trailing-slash inside content/resources/*.json
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'content', 'resources');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let totalFiles = 0;
let totalReplacements = 0;

for (const f of files) {
  const fp = path.join(dir, f);
  const before = fs.readFileSync(fp, 'utf8');
  // Match `/resources/{slug}.html` (slug = lowercase letters, digits, hyphens)
  // Optional fragment/query is preserved by lookahead.
  const re = /\/resources\/([a-z0-9-]+)\.html/g;
  let count = 0;
  const after = before.replace(re, (_m, slug) => {
    count++;
    return `/resources/${slug}/`;
  });
  if (count > 0) {
    fs.writeFileSync(fp, after);
    totalFiles++;
    totalReplacements += count;
  }
}

console.log(`Updated ${totalFiles} files, ${totalReplacements} replacements.`);
