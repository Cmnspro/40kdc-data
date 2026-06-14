// Stages the 40kdc-data entity files the ListForge 11th-edition Reference tab consumes
// into dist/core/ (mirroring the R2 bucket layout) and writes dist/manifest-core.json
// in the contract the app's Kdc40DataService expects. Run by .github/workflows/publish.yml.
//
//   data/core/<faction>/<entity>.json            -> dist/core/<faction>/<entity>.json
//   data/core/{weapon-keywords,stratagems}.json  -> dist/core/<file>
//   dist/manifest-core.json                       -> { version, generated_at, files: [{type, path}] }
//
// This repo owns ONLY the core slice + manifest-core.json. The 40kdc-abilities repo
// independently publishes the abilities slice + manifest-abilities.json. The app fetches
// both manifests and unions them, so there is no cross-repo coupling here.
//
// Only whitelisted entity files are published; missions/terrain/_example/_reports/etc.
// are skipped because the app never reads them.

import { mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DATA_CORE = 'data/core';
const DIST = 'dist';
const VERSION = process.env.VERSION || new Date().toISOString();

// filename inside a faction dir -> manifest "type" (must match the strings the
// app's Kdc40ReferenceService reads).
const FACTION_FILE_TYPES = {
  'factions.json': 'factions',
  'units.json': 'units',
  'weapons.json': 'weapons',
  'detachments.json': 'detachments',
  'enhancements.json': 'enhancements',
  'stratagems.json': 'stratagems',
  'wargear.json': 'wargear',
  'wargear-options.json': 'wargear-options',
  'unit-compositions.json': 'unit-compositions',
  'leader-attachments.json': 'leader-attachments',
};
// global files directly under data/core that the app reads.
const GLOBAL_FILE_TYPES = {
  'weapon-keywords.json': 'weapon-keywords',
  'stratagems.json': 'stratagems',
};

const files = [];
function stage(src, bucketPath, type) {
  const dest = join(DIST, bucketPath);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  files.push({ type, path: bucketPath });
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Global core files.
for (const [f, type] of Object.entries(GLOBAL_FILE_TYPES)) {
  const p = join(DATA_CORE, f);
  if (existsSync(p)) stage(p, `core/${f}`, type);
}

// Per-faction files (skip _example / _reports / etc.).
for (const entry of readdirSync(DATA_CORE)) {
  if (entry.startsWith('_')) continue;
  const dir = join(DATA_CORE, entry);
  if (!statSync(dir).isDirectory()) continue;
  for (const [f, type] of Object.entries(FACTION_FILE_TYPES)) {
    const p = join(dir, f);
    if (existsSync(p)) stage(p, `core/${entry}/${f}`, type);
  }
}

writeFileSync(
  join(DIST, 'manifest-core.json'),
  JSON.stringify({ version: VERSION, generated_at: new Date().toISOString(), files }, null, 2),
);
console.log(`Staged ${files.length} core files; version=${VERSION}`);
