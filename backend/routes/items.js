import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from "../middleware/validate.js";
import { createItemSchema, updateItemSchema } from "../validators/item.schema.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// READ all items
router.get('/', async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { category: true }, // Updated: Include category relation
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// READ single item
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.item.findUnique({ 
    where: { id },
    include: { category: true } // Updated: Include category relation
  });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// CREATE item (protected)
router.post('/', authenticateToken, validate(createItemSchema), async (req, res) => {
  try {
    const { name, brand, categoryId, costPrice, salePrice, quantity } = req.body;
    
    // Updated: Logic to use categoryId and the new table
    const item = await prisma.item.create({
      data: { 
        name, 
        brand, 
        categoryId: Number(categoryId), // Link to new Category table
        costPrice, 
        salePrice, 
        quantity, 
        isActive: true,
        type: "" // Maintaining for schema compatibility
      },
      include: { category: true }
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE item (protected)
router.patch('/:id', authenticateToken, validate(updateItemSchema), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const data = { ...req.body };
    
    // Updated: Handle categoryId conversion if present in update
    if (data.categoryId) {
      data.categoryId = Number(data.categoryId);
    }

    const item = await prisma.item.update({
      where: { id },
      data,
      include: { category: true }
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Update failed', error: String(err) });
  }
});

// DELETE item (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  try {
    const usageCount = await prisma.orderItem.count({
      where: { itemId: id }
    });

    if (usageCount > 0) {
      return res.status(400).json({ 
        message: "This item is linked to existing orders and cannot be deleted. Set it to 'Inactive' instead." 
      });
    }

    await prisma.item.delete({ where: { id } });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;