const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const NAMESPACE_ID = "dda38413b0be42e6b7bcb3ff8308439e";

const raw = execSync(
  `npx wrangler kv key list --namespace-id=${NAMESPACE_ID}`,
  { encoding: "utf-8" }
);

const keys = JSON.parse(raw);

if (keys.length === 0) {
  console.log("KV namespace empty — nothing to flush.");
  process.exit(0);
}

console.log(`Flushing ${keys.length} key(s) from NEXT_INC_CACHE_KV...`);

const tmpFile = path.join(os.tmpdir(), "kv-flush-keys.json");
fs.writeFileSync(tmpFile, JSON.stringify(keys.map((k) => k.name)));

execSync(
  `npx wrangler kv bulk delete "${tmpFile}" --namespace-id=${NAMESPACE_ID} --force`,
  { stdio: "inherit" }
);

console.log("KV flush complete.");
