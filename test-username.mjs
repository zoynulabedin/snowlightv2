import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testUsername() {
  try {
    // Test if we can create a user with role and hearts fields
    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        password: "hashedpassword",
        name: "Test User",
        role: "USER",
        hearts: 100,
      },
    });

    console.log("✅ User creation with role and hearts is working!", testUser);

    // Clean up
    await prisma.user.delete({ where: { id: testUser.id } });
  } catch (error) {
    console.error("❌ User creation error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUsername();
