#!/usr/bin/env node
// Reads all *.func files and generates a TypeScript file with string exports.
// Run automatically via prebuild / prestart.

const fs = require('fs');
const path = require('path');

const funcsDir = path.resolve(__dirname, '../src/components/Tools/jsonata/functions');
const outFile = path.join(funcsDir, 'func-strings.generated.ts');

const files = fs.readdirSync(funcsDir).filter(f => f.endsWith('.func'));
files.sort();

const entries = files.map(file => {
  const name = path.basename(file, '.func');
  const content = fs.readFileSync(path.join(funcsDir, file), 'utf8');
  // Escape backticks and template literal placeholders
  const escaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return `  { name: '${name}', func: \`${escaped}\` }`;
});

const lines = [
  '// AUTO-GENERATED — do not edit manually. Run "node scripts/generate-func-strings.cjs".',
  '',
  'export const funcEntries: { name: string; func: string }[] = [',
  ...entries.map((e, i) => e + (i < entries.length - 1 ? ',' : '')),
  '];',
  '',
];

fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`Generated ${outFile} (${files.length} funcs)`);
