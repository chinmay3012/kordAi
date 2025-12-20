import Job from "../models/Job.js";
import User from "../models/User.js";
import SavedJob from "../models/SavedJob.js";

/**
 * Job Matching Service
 * AI-powered algorithm to match jobs with user profiles
 */

/**
 * Calculate match score between a job and user profile
 * Returns a score between 0-100
 */
export function calculateMatchScore(job, userProfile) {
    let score = 0;
    let maxScore = 0;
    const matchDetails = {};

    const userSkills = new Set(
        (userProfile.skills || []).map(s => s.toLowerCase().trim())
    );
    const userRoles = new Set(
        (userProfile.desiredRoles || []).map(r => r.toLowerCase().trim())
    );

    // 1. SKILL MATCHING (40 points max)
    const skillWeight = 40;
    maxScore += skillWeight;

    const jobSkills = new Set([
        ...(job.tags || []).map(t => t.toLowerCase().trim()),
        ...(job.skills || []).map(s => s.toLowerCase().trim()),
    ]);

    if (jobSkills.size > 0 && userSkills.size > 0) {
        const matchedSkills = [...userSkills].filter(skill => {
            return [...jobSkills].some(jobSkill =>
                jobSkill.includes(skill) || skill.includes(jobSkill)
            );
        });

        const skillMatchRatio = matchedSkills.length / Math.max(userSkills.size, 1);
        const skillScore = Math.min(skillMatchRatio * skillWeight * 1.5, skillWeight);
        score += skillScore;

        matchDetails.skills = {
            matched: matchedSkills,
            count: matchedSkills.length,
            score: Math.round(skillScore),
        };
    }

    // 2. ROLE/TITLE MATCHING (25 points max)
    const roleWeight = 25;
    maxScore += roleWeight;

    const jobTitle = (job.title || "").toLowerCase();
    let roleScore = 0;
    const matchedRoles = [];

    userRoles.forEach(role => {
        if (jobTitle.includes(role)) {
            roleScore += roleWeight / userRoles.size;
            matchedRoles.push(role);
        }
    });

    // Also check partial matches
    if (roleScore === 0) {
        const titleWords = jobTitle.split(/\s+/);
        userRoles.forEach(role => {
            const roleWords = role.split(/\s+/);
            const partialMatch = roleWords.some(rw =>
                titleWords.some(tw => tw.includes(rw) || rw.includes(tw))
            );
            if (partialMatch) {
                roleScore += (roleWeight / userRoles.size) * 0.5;
                matchedRoles.push(role + " (partial)");
            }
        });
    }

    score += Math.min(roleScore, roleWeight);
    matchDetails.roles = {
        matched: matchedRoles,
        score: Math.round(Math.min(roleScore, roleWeight)),
    };

    // 3. EXPERIENCE LEVEL MATCHING (15 points max)
    const expWeight = 15;
    maxScore += expWeight;

    const userExpLevel = userProfile.experienceLevel?.toLowerCase();
    const jobExpLevel = job.experienceLevel?.toLowerCase();

    if (userExpLevel && jobExpLevel) {
        const expLevels = ["intern", "entry", "mid", "senior", "lead", "executive"];
        const userExpIdx = expLevels.indexOf(userExpLevel);
        const jobExpIdx = expLevels.indexOf(jobExpLevel);

        if (userExpIdx !== -1 && jobExpIdx !== -1) {
            const diff = Math.abs(userExpIdx - jobExpIdx);
            if (diff === 0) {
                score += expWeight;
                matchDetails.experience = { match: "exact", score: expWeight };
            } else if (diff === 1) {
                score += expWeight * 0.7;
                matchDetails.experience = { match: "close", score: Math.round(expWeight * 0.7) };
            } else if (diff === 2) {
                score += expWeight * 0.3;
                matchDetails.experience = { match: "distant", score: Math.round(expWeight * 0.3) };
            }
        }
    }

    // 4. LOCATION MATCHING (10 points max)
    const locWeight = 10;
    maxScore += locWeight;

    const userLocations = new Set(
        (userProfile.desiredLocations || []).map(l => l.toLowerCase().trim())
    );
    const remoteOnly = userProfile.remoteOnly || false;
    const jobLocation = (job.location || "").toLowerCase();
    const jobLocationType = job.locationType?.toLowerCase();

    if (remoteOnly && (jobLocationType === "remote" || jobLocation.includes("remote"))) {
        score += locWeight;
        matchDetails.location = { match: "remote", score: locWeight };
    } else if (userLocations.size > 0) {
        const locationMatch = [...userLocations].some(loc => jobLocation.includes(loc));
        if (locationMatch) {
            score += locWeight;
            matchDetails.location = { match: "exact", score: locWeight };
        } else if (jobLocationType === "remote") {
            score += locWeight * 0.8;
            matchDetails.location = { match: "remote fallback", score: Math.round(locWeight * 0.8) };
        }
    } else if (jobLocationType === "remote") {
        score += locWeight * 0.5; // Slight bonus for remote jobs
        matchDetails.location = { match: "remote default", score: Math.round(locWeight * 0.5) };
    }

    // 5. SALARY MATCHING (10 points max)
    const salaryWeight = 10;
    maxScore += salaryWeight;

    const userMinSalary = userProfile.minSalary;
    const jobSalaryMin = job.salary?.min;
    const jobSalaryMax = job.salary?.max;

    if (userMinSalary && (jobSalaryMin || jobSalaryMax)) {
        const jobSalary = jobSalaryMax || jobSalaryMin;
        if (jobSalary >= userMinSalary) {
            score += salaryWeight;
            matchDetails.salary = { match: "meets requirement", score: salaryWeight };
        } else if (jobSalary >= userMinSalary * 0.9) {
            score += salaryWeight * 0.5;
            matchDetails.salary = { match: "close", score: Math.round(salaryWeight * 0.5) };
        }
    }

    // Calculate final percentage
    const finalScore = Math.round((score / maxScore) * 100);

    return {
        score: finalScore,
        rawScore: Math.round(score),
        maxScore,
        details: matchDetails,
    };
}

/**
 * Get matched jobs for a user
 */
export async function getMatchedJobs(userId, options = {}) {
    const {
        limit = 15,
        minScore = 30, // Minimum match score to include
        excludeSeen = true,
    } = options;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Build user profile for matching
    // combine explicit preferences with parsed resume data
    const skillSet = new Set([
        ...(user.preferences?.skills || []),
        ...(user.resumeAnalysis?.skills || [])
    ]);

    const roleSet = new Set([
        ...(user.preferences?.desiredRoles || []),
        ...(user.resumeAnalysis?.preferredRoles || [])
    ]);

    const userProfile = {
        skills: Array.from(skillSet),
        desiredRoles: Array.from(roleSet),
        experienceLevel: user.preferences?.experienceLevel || user.resumeAnalysis?.experienceLevel,
        desiredLocations: user.preferences?.desiredLocations || [],
        remoteOnly: user.preferences?.remoteOnly || false,
        minSalary: user.preferences?.minSalary,
    };

    // Get jobs user has already seen
    let excludeJobIds = [];
    if (excludeSeen) {
        excludeJobIds = await SavedJob.getSeenJobIds(userId);
    }

    // Fetch active jobs
    const jobQuery = { status: "active" };
    if (excludeJobIds.length > 0) {
        jobQuery._id = { $nin: excludeJobIds };
    }

    // Get more jobs than needed for scoring
    const jobs = await Job.find(jobQuery)
        .sort({ featured: -1, scrapedAt: -1 })
        .limit(500) // Get more for better matching
        .lean();

    // Score and rank jobs
    const scoredJobs = jobs.map(job => {
        const matchResult = calculateMatchScore(job, userProfile);

        // Add slight jitter to score to avoid identical values (0-4 points)
        const jitter = Math.floor(Math.random() * 5);
        const finalScore = Math.min(100, matchResult.score + jitter);

        return {
            ...job,
            matchScore: finalScore,
            matchDetails: matchResult.details,
        };
    });

    // Check user tier
    const isPremium = user.subscription?.plan !== "free";

    // Filter and Sort YC Jobs vs Others
    const ycJobs = scoredJobs
        .filter(j => j.source?.toLowerCase() === "ycombinator" || !!j.company?.ycBatch)
        .filter(j => j.matchScore >= 10);

    const otherJobs = scoredJobs
        .filter(j => j.source?.toLowerCase() !== "ycombinator" && !j.company?.ycBatch)
        .filter(j => j.matchScore >= minScore);

    // 1. Get top YCombinator Jobs (Up to 5)
    // Prioritize ones that have founder data already populated
    const topYCMatches = ycJobs
        .sort((a, b) => {
            const aHas = (a.founders && a.founders.length > 0) ? 1 : 0;
            const bHas = (b.founders && b.founders.length > 0) ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return b.matchScore - a.matchScore;
        })
        .slice(0, 5);

    const selectedYC = topYCMatches.sort(() => Math.random() - 0.5);

    // 2. Get 5 regular jobs from other sources
    const selectedOthersCount = 5;

    const topOtherMatches = otherJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 50);

    const selectedOthers = topOtherMatches
        .sort(() => Math.random() - 0.5)
        .slice(0, selectedOthersCount);

    // FOR FREE USERS: strictly return 5 YC + 5 Regular (Exactly 10)
    if (!isPremium) {
        // Return exactly these 10 in order: 5 YC, then 5 others
        return [...selectedYC, ...selectedOthers];
    }

    // FOR PREMIUM USERS: Combine and fill up to the requested limit
    let matchedJobs = [...selectedYC, ...selectedOthers];

    if (matchedJobs.length < limit) {
        const remainingCount = limit - matchedJobs.length;
        const matchedIds = new Set(matchedJobs.map(j => j._id.toString()));

        const additionalFillers = scoredJobs
            .filter(job => !matchedIds.has(job._id.toString()))
            .sort(() => Math.random() - 0.5)
            .slice(0, remainingCount);

        matchedJobs = [...matchedJobs, ...additionalFillers];
    }

    return matchedJobs;
}

/**
 * Get matched jobs based on resume analysis (for onboarding)
 */
export async function getJobsFromResumeAnalysis(resumeAnalysis, options = {}) {
    const {
        limit = 15,
        minScore = 20,
    } = options;

    // Build profile from resume analysis
    const userProfile = {
        skills: resumeAnalysis.skills || [],
        desiredRoles: resumeAnalysis.preferredRoles || [],
        experienceLevel: resumeAnalysis.experienceLevel,
        desiredLocations: [],
        remoteOnly: true, // Default to remote for new users
        minSalary: null,
    };

    // Search for jobs matching resume keywords
    const searchKeywords = [
        ...resumeAnalysis.skills.slice(0, 10),
        ...resumeAnalysis.preferredRoles,
    ].join(" ");

    let jobs;

    if (searchKeywords.trim()) {
        // Text search first
        try {
            jobs = await Job.find(
                {
                    status: "active",
                    $text: { $search: searchKeywords }
                },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .limit(200)
                .lean();
        } catch (err) {
            // Fallback if text search fails
            jobs = await Job.find({ status: "active" })
                .sort({ scrapedAt: -1 })
                .limit(200)
                .lean();
        }
    } else {
        jobs = await Job.find({ status: "active" })
            .sort({ scrapedAt: -1 })
            .limit(200)
            .lean();
    }

    // Score jobs
    const scoredJobs = jobs.map(job => {
        const matchResult = calculateMatchScore(job, userProfile);
        return {
            ...job,
            matchScore: matchResult.score,
            matchDetails: matchResult.details,
        };
    });

    // Sort by match score and return top matches
    return scoredJobs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
}

/**
 * Update user profile based on resume analysis
 */
export async function updateUserFromResume(userId, resumeAnalysis) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
        user.preferences = {};
    }

    // Merge skills (don't overwrite, add new ones)
    const existingSkills = new Set(user.preferences.skills || []);
    resumeAnalysis.skills.forEach(skill => existingSkills.add(skill));
    user.preferences.skills = Array.from(existingSkills);

    // Set roles if not already set
    if (!user.preferences.desiredRoles || user.preferences.desiredRoles.length === 0) {
        user.preferences.desiredRoles = resumeAnalysis.preferredRoles;
    }

    // Set experience level if not already set
    if (!user.preferences.experienceLevel) {
        user.preferences.experienceLevel = resumeAnalysis.experienceLevel;
    }

    // Store resume analysis
    user.resumeAnalysis = {
        skills: resumeAnalysis.skills,
        preferredRoles: resumeAnalysis.preferredRoles,
        experienceLevel: resumeAnalysis.experienceLevel,
        yearsOfExperience: resumeAnalysis.yearsOfExperience,
        analyzedAt: new Date(),
    };

    await user.save();

    return user;
}

export default {
    calculateMatchScore,
    getMatchedJobs,
    getJobsFromResumeAnalysis,
    updateUserFromResume,
};
