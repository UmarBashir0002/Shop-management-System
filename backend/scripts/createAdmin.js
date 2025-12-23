// backend/scripts/createAdmin.js
import pkg from "@prisma/client";
import bcrypt from "bcrypt";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * EDIT THESE DETAILS BEFORE RUNNING
 */
const newUserData = {
  username: "admin_user_" + Math.floor(Math.random() * 1000), // Generates unique username
  password: "SecurePassword123!",
  name: "New System Administrator",
  role: "ADMIN"
};

async function main() {
  console.log("------------------------------------------");
  console.log("🛠️  Starting Admin Injection Script...");

  try {
    // 1. Check if username exists
    const exists = await prisma.user.findUnique({
      where: { username: newUserData.username }
    });

    if (exists) {
      console.log(`⚠️  User "${newUserData.username}" already exists. Skipping.`);
      return;
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(newUserData.password, 10);

    // 3. Insert into Database
    const user = await prisma.user.create({
      data: {
        username: newUserData.username,
        password: hashedPassword,
        name: newUserData.name,
        role: newUserData.role,
      },
    });

    console.log("✅ SUCCESS: Admin user inserted into database.");
    console.log(`👉 Username: ${user.username}`);
    console.log(`👉 Password: ${newUserData.password}`);
    console.log(`👉 Role:     ${user.role}`);
    
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error.message);
  }
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });