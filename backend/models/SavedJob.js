import mongoose from "mongoose";

/**
 * SavedJob Schema
 * Tracks user interactions with jobs (liked, saved, applied, etc.)
 */
const savedJobSchema = new mongoose.Schema(
    {
        // ==================
        // REFERENCES
        // ==================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true,
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: [true, "Job reference is required"],
            index: true,
        },

        // ==================
        // INTERACTION TYPE
        // ==================
        action: {
            type: String,
            enum: ["liked", "skipped", "saved", "applied", "hidden"],
            required: true,
            index: true,
        },

        // ==================
        // METADATA
        // ==================
        notes: {
            type: String,
            maxlength: 1000,
        },

        // Application tracking
        application: {
            status: {
                type: String,
                enum: ["not_applied", "applied", "interviewing", "offered", "rejected", "accepted", "withdrawn"],
                default: "not_applied",
            },
            appliedAt: {
                type: Date,
            },
            followUpAt: {
                type: Date,
            },
            response: {
                type: String,
                maxlength: 500,
            },
        },

        // Reminder
        reminder: {
            enabled: {
                type: Boolean,
                default: false,
            },
            date: {
                type: Date,
            },
            message: {
                type: String,
                maxlength: 200,
            },
        },

        // Source tracking
        source: {
            type: String,
            enum: ["swipe", "search", "recommendation", "shared", "direct"],
            default: "swipe",
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

// Unique constraint - one action per user-job pair
savedJobSchema.index({ user: 1, job: 1, action: 1 }, { unique: true });

// Common query patterns
savedJobSchema.index({ user: 1, action: 1, createdAt: -1 });
savedJobSchema.index({ user: 1, "application.status": 1 });
savedJobSchema.index({ job: 1, action: 1 });
savedJobSchema.index({ "reminder.enabled": 1, "reminder.date": 1 });

// ==================
// STATIC METHODS
// ==================

/**
 * Get all liked jobs for a user
 */
savedJobSchema.statics.getLikedJobs = function (userId, options = {}) {
    const { limit = 50, skip = 0 } = options;

    return this.find({ user: userId, action: "liked" })
        .populate("job")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Get all saved jobs for a user
 */
savedJobSchema.statics.getSavedJobs = function (userId, options = {}) {
    const { limit = 50, skip = 0 } = options;

    return this.find({ user: userId, action: { $in: ["liked", "saved"] } })
        .populate("job")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Get applied jobs with tracking
 */
savedJobSchema.statics.getAppliedJobs = function (userId, options = {}) {
    const { status, limit = 50, skip = 0 } = options;

    const query = { user: userId, action: "applied" };
    if (status) query["application.status"] = status;

    return this.find(query)
        .populate("job")
        .sort({ "application.appliedAt": -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Check if user has interacted with a job
 */
savedJobSchema.statics.hasInteracted = async function (userId, jobId, action = null) {
    const query = { user: userId, job: jobId };
    if (action) query.action = action;

    const exists = await this.exists(query);
    return !!exists;
};

/**
 * Get user's interaction history (for not showing already seen jobs)
 */
savedJobSchema.statics.getSeenJobIds = async function (userId) {
    const interactions = await this.find(
        { user: userId },
        { job: 1 }
    ).lean();

    return interactions.map(i => i.job);
};

/**
 * Get user stats
 */
savedJobSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$action",
                count: { $sum: 1 },
            },
        },
    ]);

    const result = {
        liked: 0,
        skipped: 0,
        saved: 0,
        applied: 0,
        hidden: 0,
    };

    stats.forEach(s => {
        result[s._id] = s.count;
    });

    return result;
};

/**
 * Get reminders due soon
 */
savedJobSchema.statics.getDueReminders = function (withinHours = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

    return this.find({
        "reminder.enabled": true,
        "reminder.date": { $gte: now, $lte: future },
    })
        .populate("user", "email profile.firstName")
        .populate("job", "title company.name applyUrl");
};

// ==================
// INSTANCE METHODS
// ==================

/**
 * Mark job as applied
 */
savedJobSchema.methods.markAsApplied = async function () {
    this.action = "applied";
    this.application.status = "applied";
    this.application.appliedAt = new Date();
    await this.save();
};

/**
 * Update application status
 */
savedJobSchema.methods.updateApplicationStatus = async function (status, response = null) {
    this.application.status = status;
    if (response) this.application.response = response;
    await this.save();
};

/**
 * Set reminder
 */
savedJobSchema.methods.setReminder = async function (date, message = "") {
    this.reminder.enabled = true;
    this.reminder.date = date;
    this.reminder.message = message;
    await this.save();
};

/**
 * Clear reminder
 */
savedJobSchema.methods.clearReminder = async function () {
    this.reminder.enabled = false;
    this.reminder.date = null;
    this.reminder.message = "";
    await this.save();
};

// ==================
// MIDDLEWARE
// ==================

/**
 * After saving, update job metrics
 */
savedJobSchema.post("save", async function (doc) {
    try {
        const Job = mongoose.model("Job");
        const job = await Job.findById(doc.job);

        if (job) {
            if (doc.action === "liked") {
                job.metrics.likes += 1;
            } else if (doc.action === "applied") {
                job.metrics.applications += 1;
            }
            await job.save();
        }
    } catch (err) {
        console.error("Error updating job metrics:", err);
    }
});

export default mongoose.model("SavedJob", savedJobSchema);
