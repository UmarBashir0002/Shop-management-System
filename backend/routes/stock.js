import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// FILTER items
router.get('/', async (req, res) => {
  const { type, brand, isActive } = req.query;
  const filters = {};
  if (type) filters.type = type;
  if (brand) filters.brand = brand;
  if (isActive !== undefined) filters.isActive = isActive === 'true';

  const items = await prisma.item.findMany({ where: filters });
  res.json(items);
});

// RESTOCK an item (protected)
router.post('/:id/restock', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity must be > 0' });

  const item = await prisma.item.update({
    where: { id },
    data: { quantity: { increment: quantity } },
  });

  res.json({ message: 'Item restocked', item });
});

// DECREMENT stock (protected, e.g., after sale)
router.post('/:id/decrement', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity must be > 0' });

  const item = await prisma.item.update({
    where: { id },
    data: { quantity: { decrement: quantity } },
  });

  res.json({ message: 'Stock updated', item });
});

// LOW-STOCK alert
router.get('/low-stock', async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;
  const items = await prisma.item.findMany({
    where: { quantity: { lte: threshold } },
  });
  res.json(items);
});

export default router;
