import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", authenticateToken, (req, res) => {
  console.log("request is ",req)
  res.json({
    message: "You accessed a protected route.",
    user: req.user,
  });
});

export default router;
