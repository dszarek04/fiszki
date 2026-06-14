const { spawnSync } = require('child_process');

// Determine host port
let port = '3001'; // Default

// Parse arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
    port = args[i + 1];
    break;
  } else if (!isNaN(Number(args[i])) && Number(args[i]) > 0) {
    port = args[i];
    break;
  }
}

// Fallback to process.env.PORT if not passed via arguments
if (!port && process.env.PORT) {
  port = process.env.PORT;
}

const parsedPort = parseInt(port, 10);
if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
  console.error(`❌ Invalid port specified: ${port}. Please provide a valid port between 1 and 65535.`);
  process.exit(1);
}

console.log(`\n🐳 Starting Fiszki in Docker on port ${parsedPort}...`);

// Run docker compose up -d --build
const dockerResult = spawnSync(
  'docker',
  ['compose', 'up', '-d', '--build'],
  {
    env: { ...process.env, PORT: String(parsedPort) },
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }
);

if (dockerResult.status !== 0) {
  console.error('❌ Failed to start Docker container.');
  process.exit(dockerResult.status || 1);
}

console.log(`\n🔗 Registering portless alias: fiszki.localhost -> localhost:${parsedPort}...`);

// Register the portless alias
const portlessResult = spawnSync(
  'npx',
  ['portless', 'alias', 'fiszki', String(parsedPort), '--force'],
  {
    stdio: 'inherit',
    shell: true
  }
);

if (portlessResult.status !== 0) {
  console.warn('⚠️ Warning: Failed to register portless alias automatically.');
  console.warn(`You can try registering it manually using: npx portless alias fiszki ${parsedPort}`);
}

console.log('\n==================================================');
console.log('🚀 Fiszki is running in Docker 24/7!');
console.log(`🌍 Access it at: https://fiszki.localhost (mapped to host port ${parsedPort})`);
console.log('🛑 To stop it, run: npm run docker:down');
console.log('==================================================\n');
