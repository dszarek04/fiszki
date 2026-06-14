const { spawnSync } = require('child_process');

console.log('\n🛑 Stopping Fiszki Docker container...');

// Run docker compose down
const dockerResult = spawnSync(
  'docker',
  ['compose', 'down'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }
);

if (dockerResult.status !== 0) {
  console.error('❌ Failed to stop Docker container.');
}

console.log('\n🔗 Removing portless alias: fiszki.localhost...');

// Remove the portless alias
const portlessResult = spawnSync(
  'npx',
  ['portless', 'alias', '--remove', 'fiszki'],
  {
    stdio: 'inherit',
    shell: true
  }
);

if (portlessResult.status !== 0) {
  console.warn('⚠️ Warning: Failed to remove portless alias (or it was not registered).');
}

console.log('\n==================================================');
console.log('✅ Fiszki container stopped and portless alias removed.');
console.log('==================================================\n');
