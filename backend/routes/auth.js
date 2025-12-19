import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";

const router = express.Router();

/**
 * =========================
 * REGISTER
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(body.password);

    await User.create({
      email: body.email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "User registered successfully"
    });
  } catch (err) {
    return res.status(400).json({
      error: err.errors || err.message
    });
  }
});

/**
 * =========================
 * LOGIN
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await comparePassword(
      body.password,
      user.password
    );

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      accessToken,
      refreshToken
    });
  } catch (err) {
    return res.status(400).json({
      error: err.errors || err.message
    });
  }
});
router.post("/waitlist", async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }
  
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: "Already on waitlist" });
    }
  
    await User.create({
      email,
      source: "waitlist"
    });
  
    return res.status(201).json({ message: "Waitlist user created" });
  });
  

  /**
 * =========================
 * ACTIVATE ACCOUNT
 * =========================
 */
router.post("/activate", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 🚫 already activated
    if (user.password) {
      return res.status(400).json({
        message: "Account already activated"
      });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.source = "auth";
    await user.save();

    return res.json({
      message: "Account activated successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "Activation failed"
    });
  }
});


/**
 * =========================
 * REFRESH TOKEN
 * =========================
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required"
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      accessToken: newAccessToken
    });
  } catch {
    return res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }
});

export default router;
