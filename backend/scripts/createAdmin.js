// backend/scripts/createAdmin.js
import pkg from '@prisma/client';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin creation...');

  // change password if you want
  const hashedPassword = await bcrypt.hash('admin1212', 10);

  // avoid duplicate admin: upsert pattern
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created/ensured:', { id: admin.id, username: admin.username });
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Script finished.');
  });
