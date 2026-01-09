const fs = require('fs');
const path = require('path');

// Configuration: Define libraries and their packages to analyze
const LIBRARIES = {
  'Material UI 4 Components': {
    packages: ['@material-ui/core', '@material-ui/lab'],
  },
  'Material UI 5 Components': {
    packages: ['@mui/material', '@mui/lab'],
  },
  'Material UI 4 Icons': {
    packages: ['@material-ui/icons'],
  },
  'Material UI 5 Icons': {
    packages: ['@mui/icons-material'],
  },
};

// Ignore list for directories and files
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'dist-types',
  'coverage',
  '.git',
  '.yarn',
  'yarn.lock',
  'package-lock.json',
  'CHANGELOG.md',
];

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function analyzeUsage(rootDir) {
  const results = {};

  for (const libName of Object.keys(LIBRARIES)) {
    results[libName] = {};
  }

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      if (IGNORE_PATTERNS.includes(item)) continue;

      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile() && EXTENSIONS.includes(path.extname(item))) {
        processFile(fullPath);
      }
    }
  }

  function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    for (const [libName, config] of Object.entries(LIBRARIES)) {
      for (const pkg of config.packages) {
        const namedImportRegex = new RegExp(
          `import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${pkg}['"]`,
          'g',
        );
        let match;
        while ((match = namedImportRegex.exec(content)) !== null) {
          const imports = match[1].split(',');
          imports.forEach(imp => {
            const componentName = imp.trim().split(' as ')[0].trim();
            if (componentName) {
              results[libName][componentName] =
                (results[libName][componentName] || 0) + 1;
            }
          });
        }

        const pathImportRegex = new RegExp(
          `import\\s+(\\w+)\\s+from\\s+['"]${pkg}\\/(\\w+)['"]`,
          'g',
        );

        while ((match = pathImportRegex.exec(content)) !== null) {
          const componentName = match[2];
          if (componentName) {
            results[libName][componentName] =
              (results[libName][componentName] || 0) + 1;
          }
        }
      }
    }
  }

  walk(rootDir);
  return results;
}

function printReport(results) {
  console.log('--- React Component Usage Analysis ---\n');

  for (const [libName, counts] of Object.entries(results)) {
    console.log(`## ${libName}`);
    const entries = Object.entries(counts);

    if (entries.length === 0) {
      console.log('  No usage found.\n');
      continue;
    }

    entries.sort((a, b) => b[1] - a[1]);

    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    console.log(`  Total Usages: ${total}\n`);

    entries.forEach(([component, count]) => {
      console.log(`  - ${component}: ${count}`);
    });
    console.log(''); 
  }
}

const targetDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : process.cwd();

console.log(`Scanning directory: ${targetDir}`);
const analysisResults = analyzeUsage(targetDir);
printReport(analysisResults);