import mongoose from "mongoose";

/**
 * User Schema
 * Handles all user-related data including auth, preferences, and activity tracking
 */
const userSchema = new mongoose.Schema(
  {
    // ==================
    // CORE FIELDS
    // ==================
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ],
      index: true,
    },

    password: {
      type: String,
      default: null, // null for waitlist users until they activate
      select: false, // Don't include password in queries by default
    },

    // ==================
    // PROFILE
    // ==================
    profile: {
      firstName: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      avatar: {
        type: String,
        default: null,
      },
      bio: {
        type: String,
        maxlength: 500,
      },
      linkedinUrl: {
        type: String,
        trim: true,
      },
      githubUrl: {
        type: String,
        trim: true,
      },
      portfolioUrl: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
    },

    // ==================
    // AUTH & STATUS
    // ==================
    source: {
      type: String,
      enum: ["waitlist", "auth", "google", "github"],
      default: "waitlist",
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "deleted"],
      default: "pending",
      index: true,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false, // Don't include in queries by default
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ==================
    // SUBSCRIPTION
    // ==================
    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium", "enterprise"],
        default: "free",
      },
      validUntil: {
        type: Date,
        default: null,
      },
      stripeCustomerId: {
        type: String,
        default: null,
      },
    },

    // ==================
    // PREFERENCES
    // ==================
    preferences: {
      // Job preferences
      desiredRoles: [{
        type: String,
        trim: true,
      }],

      desiredLocations: [{
        type: String,
        trim: true,
      }],

      remoteOnly: {
        type: Boolean,
        default: false,
      },

      minSalary: {
        type: Number,
        min: 0,
      },

      experienceLevel: {
        type: String,
        enum: ["intern", "entry", "mid", "senior", "lead", "executive"],
      },

      skills: [{
        type: String,
        trim: true,
      }],

      // Notification preferences
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      weeklyDigest: {
        type: Boolean,
        default: true,
      },

      instantAlerts: {
        type: Boolean,
        default: false,
      },
    },

    // ==================
    // ACTIVITY TRACKING
    // ==================
    activity: {
      lastLogin: {
        type: Date,
        default: null,
      },

      loginCount: {
        type: Number,
        default: 0,
      },

      lastActive: {
        type: Date,
        default: null,
      },

      jobsViewed: {
        type: Number,
        default: 0,
      },

      jobsLiked: {
        type: Number,
        default: 0,
      },

      jobsApplied: {
        type: Number,
        default: 0,
      },

      onboardingCompleted: {
        type: Boolean,
        default: false,
      },

      onboardingStep: {
        type: Number,
        default: 0,
      },
    },

    // ==================
    // ONBOARDING SELECTIONS
    // ==================
    onboarding: {
      // Step 1: Objectives
      objectives: [{
        type: String,
        trim: true,
      }],

      // Step 2: Position type
      positionType: {
        type: String,
        enum: ["full-time", "part-time", "internship"],
      },

      // Step 3: Role interests
      roleInterests: [{
        type: String,
        trim: true,
      }],

      // Step 4: Years of experience
      yearsOfExperience: {
        type: String,
        enum: ["0", "1-2", "3-5", "5-10", "10+"],
      },

      completedAt: {
        type: Date,
      },
    },

    // ==================
    // RESUME STORAGE
    // ==================
    resume: {
      // Store the actual file as base64
      fileData: {
        type: String,
        select: false, // Don't include in queries by default (large)
      },

      fileName: {
        type: String,
        trim: true,
      },

      mimeType: {
        type: String,
        trim: true,
      },

      fileSize: {
        type: Number, // Size in bytes
      },

      uploadedAt: {
        type: Date,
      },
    },

    // ==================
    // RESUME ANALYSIS
    // ==================
    resumeAnalysis: {
      skills: [{
        type: String,
        trim: true,
      }],

      preferredRoles: [{
        type: String,
        trim: true,
      }],

      experienceLevel: {
        type: String,
        enum: ["intern", "entry", "mid", "senior", "lead", "executive"],
      },

      yearsOfExperience: {
        type: Number,
        min: 0,
      },

      potentialTitles: [{
        type: String,
        trim: true,
      }],

      resumeFileName: {
        type: String,
      },

      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resume?.fileData; // Don't send large file data in JSON
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================
// INDEXES
// ==================
userSchema.index({ "status": 1, "createdAt": -1 });
userSchema.index({ "subscription.plan": 1 });
userSchema.index({ "preferences.desiredRoles": 1 });
userSchema.index({ "activity.lastActive": -1 });

// ==================
// VIRTUAL FIELDS
// ==================
userSchema.virtual("fullName").get(function () {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile?.firstName || this.email.split("@")[0];
});

userSchema.virtual("isPremium").get(function () {
  if (this.subscription?.plan === "free") return false;
  if (!this.subscription?.validUntil) return false;
  return new Date(this.subscription.validUntil) > new Date();
});

// ==================
// INSTANCE METHODS
// ==================
userSchema.methods.updateLastLogin = async function () {
  this.activity.lastLogin = new Date();
  this.activity.loginCount += 1;
  this.activity.lastActive = new Date();
  await this.save();
};

userSchema.methods.updateActivity = async function () {
  this.activity.lastActive = new Date();
  await this.save();
};

userSchema.methods.incrementJobsViewed = async function () {
  this.activity.jobsViewed += 1;
  this.activity.lastActive = new Date();
  await this.save();
};

userSchema.methods.incrementJobsLiked = async function () {
  this.activity.jobsLiked += 1;
  this.activity.lastActive = new Date();
  await this.save();
};

// ==================
// STATIC METHODS
// ==================
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ status: "active" });
};

userSchema.statics.findPremiumUsers = function () {
  return this.find({
    "subscription.plan": { $ne: "free" },
    "subscription.validUntil": { $gt: new Date() },
  });
};

export default mongoose.model("User", userSchema);
