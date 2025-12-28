import express from "express";
import { authenticateToken } from "../middleware/auth.js";

import prisma from "../prisma/db.js";

const router = express.Router();

/**
 * GET /users
 * Protected route – returns all users
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

export default router;
