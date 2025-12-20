import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { parseResumeBuffer, generateSearchKeywords } from "../services/resumeParser.js";
import User from "../models/User.js";

const router = express.Router();

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
];

/**
 * =========================
 * UPLOAD RESUME
 * =========================
 * POST /api/v1/resume/upload
 * Body: Base64 encoded file data with metadata
 */
router.post("/upload", requireAuth, async (req, res) => {
    try {
        const { fileData, fileName, mimeType } = req.body;

        // Validate required fields
        if (!fileData || !fileName || !mimeType) {
            return res.status(400).json({
                error: "Missing required fields: fileData, fileName, mimeType",
            });
        }

        // Validate MIME type
        if (!ALLOWED_TYPES.includes(mimeType)) {
            return res.status(400).json({
                error: "Invalid file type. Allowed: PDF, DOCX, DOC, TXT",
                allowedTypes: ALLOWED_TYPES,
            });
        }

        // Decode base64 file
        const buffer = Buffer.from(fileData, "base64");

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            return res.status(400).json({
                error: "File too large. Maximum size: 10MB",
            });
        }

        // Parse resume
        const resumeAnalysis = await parseResumeBuffer(buffer, mimeType);

        // Add filename to analysis
        resumeAnalysis.resumeFileName = fileName;

        // Update user profile with resume data
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Save original file data for multi-device access
        user.resume = {
            fileData: fileData,
            fileName: fileName,
            mimeType: mimeType,
            fileSize: buffer.length,
            uploadedAt: new Date()
        };

        // Cache the parsed analysis for fast matching
        user.resumeAnalysis = {
            ...resumeAnalysis,
            resumeFileName: fileName,
            analyzedAt: new Date()
        };

        await user.save();

        // Get matched jobs based on resume
        const { getJobsFromResumeAnalysis } = await import("../services/jobMatcher.js");
        const matchedJobs = await getJobsFromResumeAnalysis(resumeAnalysis, {
            limit: 15,
        });

        res.json({
            message: "Resume analyzed successfully",
            analysis: {
                skills: resumeAnalysis.skills,
                skillCount: resumeAnalysis.skillCount,
                preferredRoles: resumeAnalysis.preferredRoles,
                experienceLevel: resumeAnalysis.experienceLevel,
                yearsOfExperience: resumeAnalysis.yearsOfExperience,
            },
            matchedJobsCount: matchedJobs.length,
            topMatches: matchedJobs.slice(0, 5).map(job => ({
                id: job._id,
                title: job.title,
                company: job.company?.name || job.companyName,
                matchScore: job.matchScore,
            })),
        });
    } catch (err) {
        console.error("Resume upload error (Stack):", err);
        res.status(500).json({
            error: err.message || "Failed to process resume",
            details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
        });
    }
});

/**
 * =========================
 * ANALYZE RESUME TEXT (for testing)
 * =========================
 * POST /api/v1/resume/analyze-text
 */
router.post("/analyze-text", requireAuth, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== "string") {
            return res.status(400).json({
                error: "Missing or invalid text field",
            });
        }

        const { analyzeResumeText } = await import("../services/resumeParser.js");
        const resumeAnalysis = analyzeResumeText(text);

        res.json({
            analysis: resumeAnalysis,
            searchKeywords: generateSearchKeywords(resumeAnalysis),
        });
    } catch (err) {
        console.error("Text analysis error:", err);
        res.status(500).json({
            error: "Failed to analyze text",
        });
    }
});

/**
 * =========================
 * GET MATCHED JOBS (Based on resume)
 * =========================
 * GET /api/v1/resume/matched-jobs
 */
router.get("/matched-jobs", requireAuth, async (req, res) => {
    try {
        const limit = Math.min(50, parseInt(req.query.limit) || 15);
        const minScore = parseInt(req.query.minScore) || 20;

        // Get user with resume analysis
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user has resume analysis
        if (!user.resumeAnalysis?.skills?.length) {
            return res.status(400).json({
                error: "No resume analysis found. Please upload your resume first.",
                needsResume: true,
            });
        }

        // Get matched jobs
        const { getMatchedJobs } = await import("../services/jobMatcher.js");
        const jobs = await getMatchedJobs(req.user.userId, {
            limit,
            minScore,
            excludeSeen: req.query.excludeSeen !== "false",
        });

        res.json({
            total: jobs.length,
            jobs: jobs.map(job => ({
                ...job,
                matchScore: job.matchScore,
                matchDetails: job.matchDetails,
            })),
        });
    } catch (err) {
        console.error("Get matched jobs error:", err);
        res.status(500).json({
            error: "Failed to get matched jobs",
        });
    }
});

/**
 * =========================
 * GET RESUME STATUS
 * =========================
 * GET /api/v1/resume/status
 */
router.get("/status", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const hasResume = !!(user.resumeAnalysis?.skills?.length);

        res.json({
            hasResume,
            resumeAnalysis: hasResume ? {
                skills: user.resumeAnalysis.skills,
                preferredRoles: user.resumeAnalysis.preferredRoles,
                experienceLevel: user.resumeAnalysis.experienceLevel,
                yearsOfExperience: user.resumeAnalysis.yearsOfExperience,
                fileName: user.resumeAnalysis.resumeFileName,
                analyzedAt: user.resumeAnalysis.analyzedAt,
            } : null,
            onboardingCompleted: user.activity?.onboardingCompleted || false,
        });
    } catch (err) {
        console.error("Resume status error:", err);
        res.status(500).json({
            error: "Failed to get resume status",
        });
    }
});

/**
 * =========================
 * DELETE RESUME DATA
 * =========================
 * DELETE /api/v1/resume
 */
router.delete("/", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Clear resume analysis
        user.resumeAnalysis = undefined;
        await user.save();

        res.json({
            message: "Resume data deleted successfully",
        });
    } catch (err) {
        console.error("Delete resume error:", err);
        res.status(500).json({
            error: "Failed to delete resume data",
        });
    }
});

export default router;
