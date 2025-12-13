import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js'; // your middleware

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();
const ALLOWED_TYPES = ['PRINTER','LAPTOP','ACCESSORY','SERVICE'];

// READ all items
router.get('/', async (req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
});

// READ single item
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// CREATE item (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, brand, type, costPrice, salePrice, quantity } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'name and type are required' });
    if (!ALLOWED_TYPES.includes(type)) return res.status(400).json({ message: 'Invalid type' });

    const item = await prisma.item.create({
      data: { name, brand, type, costPrice, salePrice, quantity, isActive: true }
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE item (protected)
router.patch('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const data = req.body;
    if (data.type && !ALLOWED_TYPES.includes(data.type)) return res.status(400).json({ message: 'Invalid type' });

    const item = await prisma.item.update({
      where: { id },
      data,
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
  try {
    await prisma.item.delete({ where: { id } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Delete failed', error: String(err) });
  }
});

export default router;
