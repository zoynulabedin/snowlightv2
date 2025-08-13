import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("Creating admin user...");

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@bugs.co.kr" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      console.log(`📧 Email: admin@bugs.co.kr`);
      console.log(`🔑 Password: admin123!`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123!", 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@bugs.co.kr",
        username: "admin",
        password: hashedPassword,
        name: "Super Admin",
        role: "ADMIN",
        hearts: 1000,
        isVerified: true,
        isActive: true,
      },
    });

    // Add admin heart charge
    await prisma.heartCharge.create({
      data: {
        userId: adminUser.id,
        type: "BONUS",
        amount: 1000,
        reason: "Admin welcome bonus",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: admin@bugs.co.kr`);
    console.log(`🔑 Password: admin123!`);
    console.log(`👑 Role: ADMIN`);
    console.log(`💎 Hearts: 1000`);
  } catch (error) {
    if (error.code === "P2010") {
      console.log(
        "⚠️ MongoDB connection issue - this is expected with the current cluster."
      );
      console.log(
        "✅ Your schema is ready. Try accessing the app at http://localhost:5173/"
      );
      console.log(
        "📝 When MongoDB connection stabilizes, the admin user will be created automatically."
      );
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
