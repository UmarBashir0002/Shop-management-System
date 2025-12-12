import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes); // All auth routes prefixed with /auth
app.use("/user", userRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
