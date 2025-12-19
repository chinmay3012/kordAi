import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * =========================
 * REGISTER
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findByEmail(body.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(body.password);

    const user = await User.create({
      email: body.email,
      password: hashedPassword,
      source: "auth",
      status: "active",
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(400).json({
      error: err.errors || err.message,
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

    // Need to explicitly select password since it's hidden by default
    const user = await User.findOne({ email: body.email.toLowerCase() })
      .select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Please activate your account first",
        needsActivation: true,
      });
    }

    const isValid = await comparePassword(body.password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is suspended
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account suspended" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Update user login activity
    user.refreshToken = refreshToken;
    user.activity = user.activity || {};
    user.activity.lastLogin = new Date();
    user.activity.loginCount = (user.activity.loginCount || 0) + 1;
    user.activity.lastActive = new Date();
    user.status = "active"; // Ensure user is active
    await user.save();

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(400).json({
      error: err.errors || err.message,
    });
  }
});

/**
 * =========================
 * WAITLIST
 * =========================
 */
router.post("/waitlist", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(200).json({ message: "Already on waitlist" });
    }

    await User.create({
      email,
      source: "waitlist",
      status: "pending",
    });

    return res.status(201).json({ message: "Waitlist user created" });
  } catch (err) {
    console.error("Waitlist error:", err);
    return res.status(500).json({ message: "Failed to add to waitlist" });
  }
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
        message: "Email and password required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found on waitlist",
      });
    }

    // Already activated
    if (user.password) {
      return res.status(400).json({
        message: "Account already activated",
      });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.source = "auth";
    user.status = "active";
    await user.save();

    return res.json({
      message: "Account activated successfully",
    });
  } catch (err) {
    console.error("Activation error:", err);
    return res.status(500).json({
      message: "Activation failed",
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
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Update last active
    user.activity = user.activity || {};
    user.activity.lastActive = new Date();
    await user.save();

    return res.json({
      accessToken: newAccessToken,
    });
  } catch {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
});

/**
 * =========================
 * LOGOUT
 * =========================
 */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    // Find user with this refresh token and clear it
    const user = await User.findOne({ refreshToken }).select("+refreshToken");

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
});

/**
 * =========================
 * GET CURRENT USER (Protected)
 * =========================
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        subscription: user.subscription,
        activity: user.activity,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ message: "Failed to get user" });
  }
});

/**
 * =========================
 * UPDATE PROFILE (Protected)
 * =========================
 */
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { profile, preferences } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile fields
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    user.activity = user.activity || {};
    user.activity.lastActive = new Date();
    await user.save();

    return res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

/**
 * =========================
 * COMPLETE ONBOARDING (Protected)
 * =========================
 */
router.post("/onboarding", requireAuth, async (req, res) => {
  try {
    const { profile, preferences, onboarding: onboardingData } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Update structural onboarding data
    if (onboardingData) {
      user.onboarding = { ...user.onboarding, ...onboardingData };
    }

    // Mark onboarding as complete if finalizing
    if (req.body.finalize) {
      user.activity = user.activity || {};
      user.activity.onboardingCompleted = true;
      user.onboarding.completedAt = new Date();
    }

    user.activity = user.activity || {};
    user.activity.lastActive = new Date();
    await user.save();

    return res.json({
      message: "Onboarding data updated",
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        onboarding: user.onboarding,
      },
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    return res.status(500).json({ message: "Failed to complete onboarding" });
  }
});

export default router;
