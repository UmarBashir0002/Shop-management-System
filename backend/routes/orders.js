import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from "../middleware/validate.js";
import { createOrderSchema } from "../validators/order.schema.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// CREATE an order
router.post('/', authenticateToken, validate(createOrderSchema), async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const { itemId, quantity } of items) {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) throw new Error(`Item ${itemId} not found`);
        if (item.quantity < quantity) throw new Error(`Insufficient stock for ${item.name}`);

        await tx.item.update({
          where: { id: itemId },
          data: { quantity: item.quantity - quantity },
        });

        total += item.salePrice * quantity;
        orderItemsData.push({ itemId, quantity, price: item.salePrice });
      }

      return await tx.order.create({
        data: {
          total,
          OrderItem: { create: orderItemsData },
        },
        include: { OrderItem: true },
      });
    });

    res.json({ message: 'Order created', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all orders
router.get('/', authenticateToken, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { OrderItem: { include: { item: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// GET ORDER BY ID
router.get("/:id", authenticateToken, async (req, res) => {
  const orderId = Number(req.params.id);
  if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: { include: { item: { select: { id: true, name: true, brand: true } } } },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// UPDATE an order (Reverses stock, deletes old items, creates new ones)
router.put('/:id', authenticateToken, validate(createOrderSchema), async (req, res) => {
  const orderId = Number(req.params.id);
  const { items } = req.body;

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { OrderItem: true }
      });
      if (!existingOrder) throw new Error("Order not found");

      // 1. Restore old stock
      for (const oldItem of existingOrder.OrderItem) {
        await tx.item.update({
          where: { id: oldItem.itemId },
          data: { quantity: { increment: oldItem.quantity } }
        });
      }

      // 2. Clear old items
      await tx.orderItem.deleteMany({ where: { orderId } });

      // 3. Process new items
      let newTotal = 0;
      const newItemsData = [];
      for (const { itemId, quantity } of items) {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item || item.quantity < quantity) throw new Error(`Stock error for item ${itemId}`);
        
        await tx.item.update({
          where: { id: itemId },
          data: { quantity: { decrement: quantity } }
        });

        newTotal += item.salePrice * quantity;
        newItemsData.push({ itemId, quantity, price: item.salePrice });
      }

      return await tx.order.update({
        where: { id: orderId },
        data: { total: newTotal, OrderItem: { create: newItemsData } },
        include: { OrderItem: true }
      });
    });
    res.json({ message: 'Order updated', order: updatedOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an order (Reverses stock before deleting)
router.delete('/:id', authenticateToken, async (req, res) => {
  const orderId = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { OrderItem: true }
      });
      if (!order) throw new Error("Order not found");

      // Reverse stock
      for (const item of order.OrderItem) {
        await tx.item.update({
          where: { id: item.itemId },
          data: { quantity: { increment: item.quantity } }
        });
      }

      // Delete OrderItems first (if not set to Cascade in Prisma)
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    res.json({ message: 'Order deleted and stock restored' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;