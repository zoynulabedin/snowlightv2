import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");

    // Test connection
    await prisma.$connect();
    console.log("✅ Connected to MongoDB successfully!");

    // Test database access with a simple query
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Current user count: ${userCount}`);
    } catch (countError) {
      console.log("📝 Database may be empty, trying to create test user...");

      // Try to create a test user
      const testUser = await prisma.user.create({
        data: {
          email: "test@example.com",
          username: "testuser",
          password: "hashedpassword",
          name: "Test User",
        },
      });
      console.log("✅ Test user created:", testUser.id);

      // Now try to count again
      const userCount = await prisma.user.count();
      console.log(`📊 User count after creation: ${userCount}`);
    }

    console.log("🎉 Database is ready to use!");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
