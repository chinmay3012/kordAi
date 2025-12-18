import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

const router = express.Router();

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(body.password);

    const user = await User.create({
      email: body.email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await comparePassword(body.password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

export default router;
