const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash("admin123!", 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@Snowlight.co.kr",
        username: "admin",
        password: hashedPassword,
        name: "Snowlight Admin",
        isAdmin: true,
        isVip: true,
        vipType: "PLATINUM",
        hearts: 10000,
      },
    });

    // Add welcome heart charge
    await prisma.heartCharge.create({
      data: {
        userId: admin.id,
        type: "BONUS",
        amount: 10000,
        reason: "Admin account creation",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@Snowlight.co.kr");
    console.log("🔑 Password: admin123!");
    console.log("👑 Admin privileges: Enabled");
    console.log("💎 VIP Status: PLATINUM");
    console.log("❤️ Hearts: 10,000");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("⚠️ Admin user already exists!");
      console.log("📧 Email: admin@Snowlight.co.kr");
      console.log("🔑 Password: admin123!");
    } else {
      console.error("❌ Error creating admin user:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
