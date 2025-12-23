import express from "express";
import Job from "../models/Job.js";
import SavedJob from "../models/SavedJob.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * =========================
 * GET ALL JOBS (Protected)
 * =========================
 * Query params:
 *  - page (default 1)
 *  - limit (default 10)
 *  - keyword (optional) - text search
 *  - source (optional) - filter by source
 *  - locationType (optional) - remote, hybrid, onsite
 *  - experienceLevel (optional) - intern, entry, mid, senior, lead, executive
 *  - excludeSeen (optional) - exclude jobs user has already interacted with
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { keyword, source, locationType, experienceLevel, excludeSeen } = req.query;

    // Build filter
    const filter = { status: "active" };

    if (source) {
      filter.source = source;
    }

    if (locationType) {
      filter.locationType = locationType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Force strict source filtering as requested (covering potential variations)
    filter.source = { $in: ["YCombinator", "ycombinator", "YC"] };

    // Exclude jobs user has already seen
    if (excludeSeen === "true" && req.user?.userId) {
      const seenJobIds = await SavedJob.getSeenJobIds(req.user.userId);
      if (seenJobIds.length > 0) {
        filter._id = { $nin: seenJobIds };
      }
    }

    let query;
    let sortOptions;

    if (keyword) {
      // Text search
      query = Job.find(
        { ...filter, $text: { $search: keyword } },
        { score: { $meta: "textScore" } }
      );
      sortOptions = { score: { $meta: "textScore" }, scrapedAt: -1 };
    } else {
      query = Job.find(filter);
      sortOptions = { featured: -1, scrapedAt: -1 };
    }

    const [jobs, total] = await Promise.all([
      query
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Set pagination headers
    res.set("X-Total-Count", total.toString());
    res.set("X-Page", page.toString());
    res.set("X-Limit", limit.toString());

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      jobs,
    });
  } catch (err) {
    console.error("❌ Fetch jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

/**
 * =========================
 * GET SINGLE JOB (Protected)
 * =========================
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Increment views
    job.metrics.views += 1;
    await job.save();

    res.json({ job });
  } catch (err) {
    console.error("❌ Get job error:", err);
    res.status(500).json({ error: "Failed to get job" });
  }
});

/**
 * =========================
 * LIKE/SAVE JOB (Protected)
 * =========================
 */
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if already liked
    const existing = await SavedJob.findOne({
      user: userId,
      job: jobId,
      action: "liked",
    });

    if (existing) {
      return res.status(400).json({ error: "Job already liked" });
    }

    // Create saved job record
    await SavedJob.create({
      user: userId,
      job: jobId,
      action: "liked",
      source: req.body.source || "swipe",
    });

    res.json({ message: "Job liked successfully" });
  } catch (err) {
    console.error("❌ Like job error:", err);
    res.status(500).json({ error: "Failed to like job" });
  }
});

/**
 * =========================
 * SKIP JOB (Protected)
 * =========================
 */
router.post("/:id/skip", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    // Check if already skipped
    const existing = await SavedJob.findOne({
      user: userId,
      job: jobId,
      action: "skipped",
    });

    if (existing) {
      return res.json({ message: "Already skipped" });
    }

    // Create skipped record
    await SavedJob.create({
      user: userId,
      job: jobId,
      action: "skipped",
      source: req.body.source || "swipe",
    });

    res.json({ message: "Job skipped" });
  } catch (err) {
    console.error("❌ Skip job error:", err);
    res.status(500).json({ error: "Failed to skip job" });
  }
});

/**
 * =========================
 * UNLIKE JOB (Protected)
 * =========================
 */
router.delete("/:id/like", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    const result = await SavedJob.findOneAndDelete({
      user: userId,
      job: jobId,
      action: "liked",
    });

    if (!result) {
      return res.status(404).json({ error: "Like not found" });
    }

    // Decrement job likes
    await Job.findByIdAndUpdate(jobId, {
      $inc: { "metrics.likes": -1 },
    });

    res.json({ message: "Job unliked" });
  } catch (err) {
    console.error("❌ Unlike job error:", err);
    res.status(500).json({ error: "Failed to unlike job" });
  }
});

/**
 * =========================
 * GET LIKED JOBS (Protected)
 * =========================
 */
router.get("/user/liked", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: userId, action: "liked" })
        .populate("job")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedJob.countDocuments({ user: userId, action: "liked" }),
    ]);

    // Filter out null jobs (in case job was deleted)
    const jobs = savedJobs
      .filter(s => s.job)
      .map(s => ({
        ...s.job,
        savedAt: s.createdAt,
        savedJobId: s._id,
      }));

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    console.error("❌ Get liked jobs error:", err);
    res.status(500).json({ error: "Failed to get liked jobs" });
  }
});

/**
 * =========================
 * GET USER STATS (Protected)
 * =========================
 */
router.get("/user/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await SavedJob.getUserStats(userId);

    res.json({ stats });
  } catch (err) {
    console.error("❌ Get stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

/**
 * =========================
 * APPLY TO JOB (Protected)
 * =========================
 */
router.post("/:id/apply", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Find or create saved job record
    let savedJob = await SavedJob.findOne({
      user: userId,
      job: jobId,
    });

    if (!savedJob) {
      savedJob = new SavedJob({
        user: userId,
        job: jobId,
        action: "applied",
        source: "direct",
      });
    } else {
      savedJob.action = "applied";
    }

    savedJob.application = {
      status: "applied",
      appliedAt: new Date(),
    };

    await savedJob.save();

    // Increment application count
    job.metrics.applications += 1;
    await job.save();

    res.json({
      message: "Application tracked",
      applyUrl: job.applyUrl,
    });
  } catch (err) {
    console.error("❌ Apply job error:", err);
    res.status(500).json({ error: "Failed to track application" });
  }
});

/**
 * =========================
 * GET FEATURED JOBS (Public)
 * =========================
 */
router.get("/public/featured", async (req, res) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit) || 5);

    const jobs = await Job.find({ status: "active", featured: true })
      .sort({ scrapedAt: -1 })
      .limit(limit)
      .select("title company location salary tags applyUrl")
      .lean();

    res.json({ jobs });
  } catch (err) {
    console.error("❌ Get featured jobs error:", err);
    res.status(500).json({ error: "Failed to get featured jobs" });
  }
});

/**
 * =========================
 * GET JOB STATS (Admin)
 * =========================
 */
router.get("/admin/stats", requireAuth, async (req, res) => {
  try {
    const stats = await Job.getStats();

    const bySource = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    res.json({
      ...stats,
      bySource: bySource.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("❌ Get job stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;