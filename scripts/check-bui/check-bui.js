const fs = require('fs');
const path = require('path');

// Official --bui tokens from https://github.com/backstage/backstage/blob/168d7cc9eb2af6902ee21dd37f25b8fc0bc05438/packages/ui/src/css/tokens.css
const officialTokens = new Set([
  // Font families
  '--bui-font-regular',
  '--bui-font-monospace',
  // Font weights
  '--bui-font-weight-regular',
  '--bui-font-weight-bold',
  // Font sizes
  '--bui-font-size-1',
  '--bui-font-size-2',
  '--bui-font-size-3',
  '--bui-font-size-4',
  '--bui-font-size-5',
  '--bui-font-size-6',
  '--bui-font-size-7',
  '--bui-font-size-8',
  '--bui-font-size-9',
  '--bui-font-size-10',
  // Spacing
  '--bui-space',
  '--bui-space-0_5',
  '--bui-space-1',
  '--bui-space-1_5',
  '--bui-space-2',
  '--bui-space-3',
  '--bui-space-4',
  '--bui-space-5',
  '--bui-space-6',
  '--bui-space-7',
  '--bui-space-8',
  '--bui-space-9',
  '--bui-space-10',
  '--bui-space-11',
  '--bui-space-12',
  '--bui-space-13',
  '--bui-space-14',
  // Radius
  '--bui-radius-1',
  '--bui-radius-2',
  '--bui-radius-3',
  '--bui-radius-4',
  '--bui-radius-5',
  '--bui-radius-6',
  '--bui-radius-full',
  // Base colors
  '--bui-black',
  '--bui-white',
  // Solid background colors
  '--bui-bg-solid',
  '--bui-bg-solid-hover',
  '--bui-bg-solid-pressed',
  '--bui-bg-solid-disabled',
  // Neutral background colors
  '--bui-bg-app',
  '--bui-bg-neutral-1',
  '--bui-bg-neutral-1-hover',
  '--bui-bg-neutral-1-pressed',
  '--bui-bg-neutral-1-disabled',
  '--bui-bg-neutral-2',
  '--bui-bg-neutral-2-hover',
  '--bui-bg-neutral-2-pressed',
  '--bui-bg-neutral-2-disabled',
  '--bui-bg-neutral-3',
  '--bui-bg-neutral-3-hover',
  '--bui-bg-neutral-3-pressed',
  '--bui-bg-neutral-3-disabled',
  '--bui-bg-neutral-4',
  '--bui-bg-neutral-4-hover',
  '--bui-bg-neutral-4-pressed',
  '--bui-bg-neutral-4-disabled',
  // Status background colors
  '--bui-bg-danger',
  '--bui-bg-warning',
  '--bui-bg-success',
  '--bui-bg-info',
  // Foreground colors
  '--bui-fg-primary',
  '--bui-fg-secondary',
  '--bui-fg-disabled',
  '--bui-fg-solid',
  '--bui-fg-solid-disabled',
  // Foreground statuses
  '--bui-fg-danger',
  '--bui-fg-warning',
  '--bui-fg-success',
  '--bui-fg-info',
  '--bui-fg-danger-on-bg',
  '--bui-fg-warning-on-bg',
  '--bui-fg-success-on-bg',
  '--bui-fg-info-on-bg',
  // Border colors
  '--bui-border-1',
  '--bui-border-2',
  '--bui-border-info',
  '--bui-border-danger',
  '--bui-border-warning',
  '--bui-border-success',
  // Special colors
  '--bui-ring',
  '--bui-scrollbar',
  '--bui-scrollbar-thumb',
  // Shadows
  '--bui-shadow',
  // Animation
  '--bui-animate-pulse',
]);

const rootDir = path.resolve(__dirname, '../..');
const dirs = ['packages', 'plugins'].map(d => path.join(rootDir, d));
const buiTokens = new Set();
const tokenFiles = new Map(); // token -> Set of relative file paths

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/--bui[\w-]*/g);
  if (matches) {
    const relPath = path.relative(rootDir, filePath);
    for (const m of matches) {
      buiTokens.add(m);
      if (!tokenFiles.has(m)) {
        tokenFiles.set(m, new Set());
      }
      tokenFiles.get(m).add(relPath);
    }
  }
}

function scanDir(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      scanDir(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    scanDir(dir);
  }
}

const sorted = [...buiTokens].sort();
const unknown = sorted.filter(t => !officialTokens.has(t));
const known = sorted.filter(t => officialTokens.has(t));

console.log(
  `Found ${sorted.length} unique --bui tokens (${known.length} official, ${unknown.length} unknown)\n`,
);

if (unknown.length > 0) {
  console.log(`--- Unknown tokens (${unknown.length}) ---\n`);
  unknown.forEach(t => {
    console.log(t);
    const files = [...tokenFiles.get(t)].sort();
    files.forEach(f => console.log(`  ${f}`));
  });
}

console.log(`\n--- Official tokens used (${known.length}) ---\n`);
known.forEach(t => console.log(t));
