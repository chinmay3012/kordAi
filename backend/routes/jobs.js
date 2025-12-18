// import express from "express";
// import Job from "../models/Job.js";
// import cors from "cors"; // Add this line if cors is not already imported

// const router = express.Router();
// app.use(cors());


// /**
//  * GET /jobs
//  * Query params:
//  *  - page (default 1)
//  *  - limit (default 10)
//  *  - keyword (optional)
//  *  - source (optional)
//  */
// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const { keyword, source } = req.query;

//     const filter = {};

//     if (source) {
//       filter.source = source;
//     }

//     if (keyword) {
//       filter.title = { $regex: keyword, $options: "i" };
//     }

//     const jobs = await Job.find(filter)
//       .sort({ scrapedAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Job.countDocuments(filter);

//     res.json({
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//       jobs,
//     });
//   } catch (err) {
//     console.error("❌ Fetch jobs error:", err);
//     res.status(500).json({ error: "Failed to fetch jobs" });
//   }
// });

// export default router;



import express from "express";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET /jobs
 * Query params:
 *  - page (default 1)
 *  - limit (default 10)
 *  - keyword (optional)
 *  - source (optional)
 */
router.get("/", requireAuth , async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { keyword, source } = req.query;

    const filter = {};

    if (source) {
      filter.source = source;
    }

    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }

    const jobs = await Job.find(filter)
      .sort({ scrapedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    console.error("❌ Fetch jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

export default router;