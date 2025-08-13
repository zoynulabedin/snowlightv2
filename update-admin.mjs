import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    // Update admin user with role
    const admin = await prisma.user.update({
      where: { email: 'admin@bugs.co.kr' },
      data: {
        role: 'SUPER_ADMIN'
      }
    });
    
    console.log('✅ Admin user updated successfully!');
    console.log('📧 Email: admin@bugs.co.kr');
    console.log('🔑 Password: admin123!');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('💎 VIP Status: PLATINUM');
    console.log('❤️ Hearts: 10,000');
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();

