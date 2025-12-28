import express from "express";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
import prisma from "../prisma/db.js";
// Sales Report
router.get("/sales", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date("1970-01-01"),
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      include: { OrderItem: { include: { item: true } } },
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    res.json({ totalOrders: orders.length, totalRevenue, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Print Jobs Report
router.get("/print-jobs", authenticateToken, async (req, res) => {
  try {
    const printJobs = await prisma.printJob.findMany();

    const totalPages = printJobs.reduce((acc, job) => acc + job.pages, 0);
    const totalRevenue = printJobs.reduce((acc, job) => acc + (job.total_amount || 0), 0);

    const paymentSummary = printJobs.reduce((acc, job) => {
      acc[job.payment_status] = (acc[job.payment_status] || 0) + 1;
      return acc;
    }, {});

    res.json({ totalJobs: printJobs.length, totalPages, totalRevenue, paymentSummary, printJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory Report
router.get("/inventory", authenticateToken, async (req, res) => {
  try {
    const items = await prisma.item.findMany();

    const lowStock = items.filter(i => i.quantity < 5);

    res.json({ totalItems: items.length, lowStock, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
