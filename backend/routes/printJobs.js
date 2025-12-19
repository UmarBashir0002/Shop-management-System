// backend/routes/printJobs.js

import express from 'express';
import pkg from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from "../middleware/validate.js";
import { createPrintJobSchema } from "../validators/printJob.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router = express.Router();

/**
 * Create a new print job
 */
router.post("/", authenticateToken, validate(createPrintJobSchema), async (req, res) => {
  try {
    const { customer_name, pages, rate } = req.body;

    if (pages === undefined || rate === undefined) {
      return res.status(400).json({ message: "Pages and rate are required" });
    }

    const total_amount = pages * rate;

    const job = await prisma.printJob.create({
      data: {
        customer_name,
        pages,
        rate,
        total_amount,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error creating print job", error: error.message });
  }
});

/**
 * Get all print jobs
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const jobs = await prisma.printJob.findMany();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching print jobs", error: error.message });
  }
});

/**
 * Get a single print job by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.printJob.findUnique({ where: { id: Number(id) } });
    if (!job) return res.status(404).json({ message: "Print job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching print job", error: error.message });
  }
});

/**
 * Update a print job by ID
 */
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { pages, rate, payment_status } = req.body;

  try {
    const existingJob = await prisma.printJob.findUnique({ where: { id: Number(id) } });
    if (!existingJob) return res.status(404).json({ message: "Print job not found" });

    const updatedData = {};
    if (pages !== undefined) updatedData.pages = pages;
    if (rate !== undefined) updatedData.rate = rate;
    if (pages !== undefined || rate !== undefined) {
      updatedData.total_amount = (pages ?? existingJob.pages) * (rate ?? existingJob.rate);
    }
    if (payment_status !== undefined) updatedData.payment_status = payment_status;

    const updatedJob = await prisma.printJob.update({
      where: { id: Number(id) },
      data: updatedData,
    });

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Error updating print job", error: error.message });
  }
});

/**
 * Delete a print job by ID
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.printJob.delete({ where: { id: Number(id) } });
    res.json({ message: "Print job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting print job", error: error.message });
  }
});

export default router;
