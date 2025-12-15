import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from "../middleware/validate.js";
import { createOrderSchema } from "../validators/order.schema.js";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// CREATE an order (protected)
router.post('/', authenticateToken, validate(createOrderSchema), async (req, res) => {
  const { items } = req.body; // [{ itemId, quantity }]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required' });
  }


  // Update stock & calculate total
 let total = 0;

const orderItemsData = await prisma.$transaction(async (tx) => {
  const result = [];

  for (const { itemId, quantity } of items) {
    const item = await tx.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    if (item.quantity < quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    await tx.item.update({
      where: { id: itemId },
      data: {
        quantity: item.quantity - quantity, // explicit update (safer for SQLite)
      },
    });

    total += item.salePrice * quantity;

    result.push({
      itemId,
      quantity,
      price: item.salePrice,
    });
  }

  return result;
});


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

// GET ORDER BY ID (Invoice)
router.get("/:id", authenticateToken, async (req, res) => {
  const orderId = Number(req.params.id);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
});


export default router;
