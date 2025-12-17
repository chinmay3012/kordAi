import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(200).json({
        message: "Already on waitlist",
      });
    }

    await User.create({ email });

    res.status(201).json({
      message: "Added to waitlist",
    });
  } catch (err) {
    console.error("Waitlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
