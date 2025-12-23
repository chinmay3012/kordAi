import mongoose from "mongoose";

/**
 * Founder Sub-Schema
 * For Y Combinator and other startup founder information
 */
const founderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

/**
 * Company Sub-Schema
 * Detailed company information
 */
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    slogan: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
    },
    founded: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    funding: {
      stage: {
        type: String,
        enum: ["pre-seed", "seed", "series-a", "series-b", "series-c", "series-d+", "public", "bootstrapped"],
      },
      amount: String,
      investors: [String],
    },
    // YC specific
    ycBatch: {
      type: String, // e.g., "W24", "S23"
      trim: true,
    },
    ycSlug: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Salary Sub-Schema
 * Structured salary information
 */
const salarySchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      min: 0,
    },
    max: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    period: {
      type: String,
      enum: ["hourly", "monthly", "yearly"],
      default: "yearly",
    },
    equity: {
      type: String, // e.g., "0.1% - 0.5%"
    },
    displayText: {
      type: String, // Raw salary text from source
    },
  },
  { _id: false }
);

/**
 * Job Schema
 * Main job listing model
 */
const jobSchema = new mongoose.Schema(
  {
    // ==================
    // CORE FIELDS
    // ==================
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 200,
      index: true,
    },

    description: {
      type: String,
      maxlength: 10000,
    },

    shortDescription: {
      type: String,
      maxlength: 500,
    },

    // ==================
    // COMPANY
    // ==================
    company: companySchema,

    // Legacy field for backward compatibility
    companyName: {
      type: String,
      trim: true,
      index: true,
    },

    // ==================
    // LOCATION
    // ==================
    location: {
      type: String,
      trim: true,
      default: "Remote",
      index: true,
    },

    locationType: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "remote",
    },

    timezone: {
      type: String,
      trim: true, // e.g., "PST", "EST", "GMT+5:30"
    },

    // ==================
    // JOB DETAILS
    // ==================
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },

    experienceLevel: {
      type: String,
      enum: ["intern", "entry", "mid", "senior", "lead", "executive"],
      index: true,
    },

    department: {
      type: String,
      trim: true,
    },

    // ==================
    // SALARY
    // ==================
    salary: salarySchema,

    // Legacy field for backward compatibility
    salaryText: {
      type: String,
      trim: true,
    },

    // ==================
    // SKILLS & TAGS
    // ==================
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    skills: [{
      type: String,
      trim: true,
    }],

    requirements: [{
      type: String,
      trim: true,
    }],

    benefits: [{
      type: String,
      trim: true,
    }],

    // ==================
    // APPLICATION
    // ==================
    applyUrl: {
      type: String,
      trim: true,
    },

    applyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    applicationDeadline: {
      type: Date,
    },

    // ==================
    // SOURCE & TRACKING
    // ==================
    source: {
      type: String,
      required: true,
      enum: ["RemoteOK", "YCombinator", "ycombinator", "LinkedIn", "Indeed", "Manual", "Other", "YC"],
      index: true,
    },

    sourceId: {
      type: String, // Original ID from source
      trim: true,
    },

    sourceUrl: {
      type: String, // Original URL from source
      trim: true,
    },

    // ==================
    // FOUNDERS (for startups)
    // ==================
    founders: [founderSchema],

    // ==================
    // STATUS & DATES
    // ==================
    status: {
      type: String,
      enum: ["active", "expired", "filled", "removed"],
      default: "active",
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    postedAt: {
      type: Date, // Original posting date from source
    },

    expiresAt: {
      type: Date,
    },

    lastVerified: {
      type: Date,
      default: Date.now,
    },

    // ==================
    // ENGAGEMENT METRICS
    // ==================
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      applications: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================
// INDEXES
// ==================

// Text search index for full-text search
jobSchema.index(
  { title: "text", "company.name": "text", description: "text", tags: "text" },
  { weights: { title: 10, "company.name": 5, tags: 3, description: 1 } }
);

// Compound indexes for common queries
jobSchema.index({ status: 1, scrapedAt: -1 });
jobSchema.index({ status: 1, featured: -1, scrapedAt: -1 });
jobSchema.index({ source: 1, status: 1 });
jobSchema.index({ locationType: 1, status: 1 });
jobSchema.index({ experienceLevel: 1, status: 1 });

// Unique constraint to prevent duplicates
jobSchema.index(
  { title: 1, "company.name": 1, applyUrl: 1 },
  { unique: true, sparse: true }
);

// Legacy unique constraint (for backward compatibility)
jobSchema.index(
  { title: 1, companyName: 1, applyUrl: 1 },
  { unique: true, sparse: true, name: "legacy_unique_job" }
);

// ==================
// VIRTUAL FIELDS
// ==================
jobSchema.virtual("isExpired").get(function () {
  if (this.expiresAt) {
    return new Date(this.expiresAt) < new Date();
  }
  // Consider jobs older than 60 days as potentially expired
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  return this.scrapedAt < sixtyDaysAgo;
});

jobSchema.virtual("salaryRange").get(function () {
  if (this.salary?.min && this.salary?.max) {
    const currency = this.salary.currency || "USD";
    const period = this.salary.period || "yearly";
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()} / ${period}`;
  }
  return this.salaryText || this.salary?.displayText || null;
});

jobSchema.virtual("companyDisplayName").get(function () {
  return this.company?.name || this.companyName || "Unknown Company";
});

// ==================
// INSTANCE METHODS
// ==================
jobSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  await this.save();
};

jobSchema.methods.incrementLikes = async function () {
  this.metrics.likes += 1;
  await this.save();
};

jobSchema.methods.incrementApplications = async function () {
  this.metrics.applications += 1;
  await this.save();
};

jobSchema.methods.markAsExpired = async function () {
  this.status = "expired";
  await this.save();
};

// ==================
// STATIC METHODS
// ==================
jobSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, status: "active" }).sort({ scrapedAt: -1 });
};

jobSchema.statics.findFeatured = function () {
  return this.find({ status: "active", featured: true }).sort({ scrapedAt: -1 });
};

jobSchema.statics.searchJobs = function (keyword, options = {}) {
  const { limit = 20, skip = 0, source, locationType, experienceLevel } = options;

  const query = { status: "active" };

  if (source) query.source = source;
  if (locationType) query.locationType = locationType;
  if (experienceLevel) query.experienceLevel = experienceLevel;

  if (keyword) {
    return this.find({ ...query, $text: { $search: keyword } })
      .sort({ score: { $meta: "textScore" }, scrapedAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  return this.find(query).sort({ scrapedAt: -1 }).skip(skip).limit(limit);
};

jobSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        totalViews: { $sum: "$metrics.views" },
        totalLikes: { $sum: "$metrics.likes" },
        totalApplications: { $sum: "$metrics.applications" },
        bySource: { $push: "$source" },
      },
    },
  ]);

  return stats[0] || { totalJobs: 0, totalViews: 0, totalLikes: 0, totalApplications: 0 };
};

// ==================
// PRE-SAVE HOOKS
// ==================
jobSchema.pre("save", function (next) {
  // Sync legacy companyName field
  if (this.company?.name && !this.companyName) {
    this.companyName = this.company.name;
  }
  if (this.companyName && !this.company?.name) {
    if (!this.company) this.company = {};
    this.company.name = this.companyName;
  }

  // Sync legacy salaryText field
  if (this.salary?.displayText && !this.salaryText) {
    this.salaryText = this.salary.displayText;
  }

  next();
});

export default mongoose.model("Job", jobSchema);
