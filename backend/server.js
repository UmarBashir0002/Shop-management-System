import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import itemsRoutes from './routes/items.js';
import stockRoutes from './routes/stock.js';
import orderRoutes from './routes/orders.js';
import printJobRoutes from './routes/printJobs.js';
import categoryRoutes from './routes/category.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
// import userRoutes from "./routes/user.routes.js";
import reports from './routes/reports.js';
import helmet from "helmet";

const app = express();



const initializeDb = () => {
  if (process.env.NODE_ENV !== 'development') {
    const userDataPath = path.join(process.env.APPDATA, 'shop-management-system');
    const dbPath = path.join(userDataPath, 'database.db');

    if (!fs.existsSync(dbPath)) {
      console.log("Setting up database for first use...");
      // Option A: Copy a blank template database from your project
      const templateDbPath = path.join(process.resourcesPath, 'backend/prisma/database.db');
      fs.copyFileSync(templateDbPath, dbPath);
    }
  }
};

initializeDb();


app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes); // All auth routes prefixed with /auth
app.use("/user", userRoutes);
app.use('/items', itemsRoutes);
app.use('/stock', stockRoutes);
app.use('/orders', orderRoutes);
app.use('/printJobs', printJobRoutes);
app.use('/reports', reports);
app.use('/category', categoryRoutes);
// app.use("/users", userRoutes);

app.use(helmet());





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
