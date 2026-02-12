/**
 * Prisma Database Seed
 * Creates default users and sample data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qaptain.app' },
    update: {},
    create: {
      email: 'admin@qaptain.app',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@qaptain.app' },
    update: {},
    create: {
      email: 'demo@qaptain.app',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
    },
  });

  console.log('✅ Demo user created:', demo.email);

  // Create sample app
  const app = await prisma.app.upsert({
    where: { id: 'sample-app-id' },
    update: {},
    create: {
      id: 'sample-app-id',
      name: 'Sample Web App',
      description: 'A sample application for testing',
      url: 'https://example.com',
      stagingUrl: 'https://staging.example.com',
      productionUrl: 'https://example.com',
      authType: 'NONE',
      userId: demo.id,
    },
  });

  console.log('✅ Sample app created:', app.name);

  // Create environments
  const devEnv = await prisma.environment.create({
    data: {
      name: 'development',
      baseUrl: 'http://localhost:3000',
      isDefault: true,
      appId: app.id,
    },
  });

  const stagingEnv = await prisma.environment.create({
    data: {
      name: 'staging',
      baseUrl: 'https://staging.example.com',
      appId: app.id,
    },
  });

  console.log('✅ Environments created');

  // Create sample test suite
  const suite = await prisma.testSuite.create({
    data: {
      name: 'Smoke Tests',
      description: 'Basic smoke tests for the application',
      type: 'SMOKE',
      appId: app.id,
    },
  });

  console.log('✅ Sample test suite created:', suite.name);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@qaptain.app / admin123');
  console.log('   Demo:  demo@qaptain.app / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
