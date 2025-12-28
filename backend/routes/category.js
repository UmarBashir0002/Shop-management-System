import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

import prisma from "../prisma/db.js";
const router = express.Router();

// GET all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// CREATE a category
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });

  try {
    const category = await prisma.category.create({
      data: { name: name.toUpperCase() }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: "Category already exists" });
  }
});

// DELETE a category
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(400).json({ message: "Cannot delete category linked to items" });
  }
});

export default router;