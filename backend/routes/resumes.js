import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Resume } from "../models/index.js";

const router = express.Router();

/**
 * GET all resumes
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, resumes });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch resumes" });
    }
});

/**
 * POST add new resume
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, fileUrl, content, version, isPrimary } = req.body;

        // If setting as primary, unset others for this user
        if (isPrimary) {
            await Resume.updateMany({ user: req.user.userId }, { isPrimary: false });
        }

        const newResume = new Resume({
            user: req.user.userId,
            name,
            fileUrl,
            content,
            version,
            isPrimary: !!isPrimary
        });

        await newResume.save();
        res.status(201).json({ success: true, resume: newResume });
    } catch (err) {
        res.status(500).json({ error: "Failed to save resume" });
    }
});

/**
 * DELETE resume
 */
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        res.json({ success: true, message: "Resume deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete resume" });
    }
});

export default router;
