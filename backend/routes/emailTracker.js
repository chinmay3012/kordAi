import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { EmailTrack } from "../models/index.js";

const router = express.Router();

/**
 * GET tracked emails
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const tracks = await EmailTrack.find({ user: req.user.userId })
            .sort({ sentAt: -1 });
        res.json({ success: true, tracks });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch email tracks" });
    }
});

/**
 * POST track new email
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const { job, companyName, position, founderEmail } = req.body;

        if (!companyName || !position || !founderEmail) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newTrack = new EmailTrack({
            user: req.user.userId,
            job,
            companyName,
            position,
            founderEmail,
            status: "sent"
        });

        await newTrack.save();
        res.status(201).json({ success: true, track: newTrack });
    } catch (err) {
        res.status(500).json({ error: "Failed to track email" });
    }
});

export default router;
