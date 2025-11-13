const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('Generating API Client TypeScript Docs');
console.log('==========================================\n');

console.log('Step 1: Building typedoc-mintlify plugin...');
try {
  execSync('npm run build', { 
    cwd: path.join(__dirname, '..', '..', 'typedoc-mintlify'),
    stdio: 'inherit'
  });
  console.log('✅ Plugin built successfully\n');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}

console.log('Step 2: Installing dependencies in api-client-ts...');
try {
  execSync('yarn install', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed\n');
} catch (e) {
  console.error('❌ Install failed:', e.message);
  process.exit(1);
}

console.log('Step 3: Generating documentation...');
try {
  execSync('yarn docs', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Documentation generated\n');
} catch (e) {
  console.error('❌ Docs generation failed:', e.message);
  if (e.stdout) console.error('Stdout:', e.stdout.toString());
  if (e.stderr) console.error('Stderr:', e.stderr.toString());
  process.exit(1);
}

console.log('Step 4: Verifying output...');
const docsDir = path.join(__dirname, '..', '..', 'docs', 'reference', 'ts');
if (!fs.existsSync(docsDir)) {
  console.error('❌ Directory does not exist:', docsDir);
  process.exit(1);
}

const files = fs.readdirSync(docsDir);
console.log(`✅ Found ${files.length} files`);
if (files.length > 0) {
  files.slice(0, 10).forEach(f => console.log(`  - ${f}`));
} else {
  console.error('❌ No files generated!');
  process.exit(1);
}

console.log('\n==========================================');
console.log('✅ Documentation generation complete!');
console.log('==========================================');
