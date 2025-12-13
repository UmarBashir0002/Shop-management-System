import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// CREATE an order (protected)
router.post('/', authenticateToken, async (req, res) => {
  const { items } = req.body; // [{ itemId, quantity }]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required' });
  }

  let total = 0;

  // Update stock & calculate total
  const orderItemsData = await Promise.all(
    items.map(async ({ itemId, quantity }) => {
      const item = await prisma.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error(`Item ${itemId} not found`);
      if (item.quantity < quantity) throw new Error(`Insufficient stock for ${item.name}`);

      // decrement stock
      await prisma.item.update({
        where: { id: itemId },
        data: { quantity: { decrement: quantity } },
      });

      total += item.salePrice * quantity;
      return { itemId, quantity, price: item.salePrice };
    })
  );

  const order = await prisma.order.create({
    data: {
      total,
      OrderItem: { create: orderItemsData },
    },
    include: { OrderItem: true },
  });

  res.json({ message: 'Order created', order });
});

// GET all orders
router.get('/', authenticateToken, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { OrderItem: { include: { item: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

export default router;
