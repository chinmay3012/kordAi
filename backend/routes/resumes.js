import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { Resume, User } from "../models/index.js";

const router = express.Router();

/**
 * GET all resumes
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        // 1. Get explicitly managed resumes
        const managedResumes = await Resume.find({ user: req.user.userId })
            .sort({ createdAt: -1 });

        // 2. Check for legacy/onboarding resume in User model
        const user = await User.findById(req.user.userId);

        let allResumes = [...managedResumes];

        // If user has a resume uploaded via onboarding but not in Resume collection
        if (user.resume && user.resume.fileName && !managedResumes.some(r => r.name === user.resume.fileName)) {
            allResumes.push({
                _id: "onboarding-resume",
                name: user.resume.fileName,
                version: "Primary",
                isPrimary: true,
                createdAt: user.resume.uploadedAt || new Date(),
                isLegacy: true
            });
        }

        res.json({ success: true, resumes: allResumes });
    } catch (err) {
        console.error("Fetch resumes error:", err);
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
 * GET resume data (base64)
 */
router.get("/:id/data", requireAuth, async (req, res) => {
    try {
        if (req.params.id === "onboarding-resume") {
            const user = await User.findById(req.user.userId).select("+resume.fileData");
            if (!user || !user.resume || !user.resume.fileData) {
                return res.status(404).json({ error: "Resume file not found" });
            }
            return res.json({
                success: true,
                fileData: user.resume.fileData,
                mimeType: user.resume.mimeType,
                fileName: user.resume.fileName
            });
        }

        const resume = await Resume.findOne({ _id: req.params.id, user: req.user.userId });
        if (!resume) {
            return res.status(404).json({ error: "Resume not found" });
        }

        res.json({
            success: true,
            fileData: resume.fileUrl, // Using fileUrl as the storage field for now
            mimeType: "application/pdf"
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch resume data" });
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
