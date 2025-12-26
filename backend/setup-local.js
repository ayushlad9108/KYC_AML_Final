const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Compliance Platform (Local Mode - No Docker)');
console.log('='.repeat(60));

try {
  // 1. Copy SQLite schema
  console.log('📋 1. Setting up SQLite database...');
  const sqliteSchema = fs.readFileSync(path.join(__dirname, 'prisma/schema.sqlite.prisma'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'prisma/schema.prisma'), sqliteSchema);
  console.log('✅ SQLite schema configured');

  // 2. Copy local environment
  console.log('🔧 2. Setting up environment...');
  fs.copyFileSync(path.join(__dirname, '.env.local'), path.join(__dirname, '.env'));
  console.log('✅ Environment configured');

  // 3. Generate Prisma client
  console.log('🔄 3. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Prisma client generated');

  // 4. Run migrations
  console.log('📊 4. Creating database...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Database created');

  // 5. Seed database
  console.log('🌱 5. Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Database seeded');

  console.log('');
  console.log('🎉 Setup Complete!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Admin: admin@demo.com / password123');
  console.log('   Compliance: compliance@demo.com / password123');
  console.log('   Analyst: analyst@demo.com / password123');
  console.log('');
  console.log('🚀 Start the server with: npm run dev');
  console.log('');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}