import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { validate } from "../middleware/validate.js";
import { loginSchema ,newPasswordSchema} from "../validators/auth.schema.js";
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post("/login",validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid User." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
 
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Passwrod." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET, // define JWT_SECRET in your .env file
      { expiresIn: "12h" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/change-password", authenticateToken,validate(newPasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Extracted from the authenticate middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required." });
    }

    // 1. Find user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
