// Copies Prisma query engine from .prisma to @prisma/client for deploy hosts
// that look for the engine alongside the client package.
const fs = require('fs');
const path = require('path');

const engineCandidates = [
  'libquery_engine-debian-openssl-3.0.x.so.node',
  'libquery_engine-debian-openssl-1.1.x.so.node',
  'query_engine-windows.dll.node',
];

const fromDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const toDir = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');

try {
  if (!fs.existsSync(fromDir)) process.exit(0);
  if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });

  for (const file of engineCandidates) {
    const src = path.join(fromDir, file);
    const dest = path.join(toDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      // eslint-disable-next-line no-console
      console.log(`[prisma] copied ${file} -> @prisma/client`);
    }
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[prisma] engine copy skipped:', e && e.message ? e.message : e);
}


