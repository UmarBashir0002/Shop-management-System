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
import reports from './routes/reports.js';
import helmet from "helmet";




console.log("loaded")

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes); // All auth routes prefixed with /auth
app.use("/user", userRoutes);
app.use('/items', itemsRoutes);
app.use('/stock', stockRoutes);
app.use('/orders', orderRoutes);
app.use('/printJobs', printJobRoutes);
app.use('/reports', reports);
app.use(helmet());





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
