import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from "../middleware/validate.js";
import { createOrderSchema } from "../validators/order.schema.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

// Helper to determine order status
const getStatus = (total, paid) => {
  const p = parseFloat(paid) || 0;
  if (p <= 0) return "UNPAID";
  if (p < total) return "PARTIAL";
  return "PAID";
};

// 1. CREATE Order
router.post('/', authenticateToken, validate(createOrderSchema), async (req, res) => {
  const { items, paidAmount } = req.body;
  
  // Safe parsing of the paid amount
  const parsedPaidAmount = parseFloat(paidAmount) || 0;

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const { itemId, quantity } of items) {
        const item = await tx.item.findUnique({ where: { id: Number(itemId) } });
        
        if (!item) throw new Error(`Item with ID ${itemId} not found`);
        if (item.quantity < quantity) throw new Error(`Stock error for ${item.name}`);

        // Update Stock
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: { decrement: Number(quantity) } },
        });

        total += item.salePrice * Number(quantity);
        orderItemsData.push({ 
          itemId: item.id, 
          quantity: Number(quantity), 
          price: item.salePrice 
        });
      }

      return await tx.order.create({
        data: {
          total: total,
          paidAmount: parsedPaidAmount,
          status: getStatus(total, parsedPaidAmount),
          OrderItem: { create: orderItemsData },
        },
        include: { OrderItem: true },
      });
    });

    res.json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error("Order Creation Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// 2. GET ALL Orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        OrderItem: { 
          include: { item: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// 3. GET SINGLE Order
router.get("/:id", authenticateToken, async (req, res) => {
  const orderId = Number(req.params.id);
  if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: { 
          include: { 
            item: true 
          } 
        },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

// 4. UPDATE Order
router.put('/:id', authenticateToken, validate(createOrderSchema), async (req, res) => {
  const orderId = Number(req.params.id);
  const { items, paidAmount } = req.body;

  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { OrderItem: true }
      });
      
      if (!existingOrder) throw new Error("Order not found");

      // 1. Restore old stock before applying new changes
      for (const oldItem of existingOrder.OrderItem) {
        await tx.item.update({
          where: { id: oldItem.itemId },
          data: { quantity: { increment: oldItem.quantity } }
        });
      }

      // 2. Delete old items
      await tx.orderItem.deleteMany({ where: { orderId } });

      // 3. Process new items and calculate new total
      let newTotal = 0;
      const newItemsData = [];
      for (const { itemId, quantity } of items) {
        const item = await tx.item.findUnique({ where: { id: Number(itemId) } });
        if (!item || item.quantity < quantity) throw new Error(`Stock error for ${item?.name || 'Unknown Item'}`);
        
        await tx.item.update({
          where: { id: item.id },
          data: { quantity: { decrement: Number(quantity) } }
        });

        newTotal += item.salePrice * Number(quantity);
        newItemsData.push({ itemId: item.id, quantity: Number(quantity), price: item.salePrice });
      }

      // 4. Determine final paid amount and status
      const finalPaid = paidAmount !== undefined ? parseFloat(paidAmount) : existingOrder.paidAmount;

      return await tx.order.update({
        where: { id: orderId },
        data: { 
          total: newTotal, 
          paidAmount: finalPaid,
          status: getStatus(newTotal, finalPaid),
          OrderItem: { create: newItemsData } 
        },
        include: { OrderItem: true }
      });
    });
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE Order
router.delete('/:id', authenticateToken, async (req, res) => {
  const orderId = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { OrderItem: true }
      });

      if (!order) throw new Error("Order not found");

      // Restore stock
      for (const item of order.OrderItem) {
        await tx.item.update({
          where: { id: item.itemId },
          data: { quantity: { increment: item.quantity } }
        });
      }

      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    res.json({ message: 'Order deleted and stock restored' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;