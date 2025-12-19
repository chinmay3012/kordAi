import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMatchedJobs, fetchJobs, likeJob, skipJob, getResumeStatus } from "../api/jobs";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform
} from "framer-motion";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasResume, setHasResume] = useState(null);
  const [saving, setSaving] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Swipe motion value
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [-80, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 80], [0, 1]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Check auth and onboarding status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    async function checkOnboarding() {
      try {
        const res = await getResumeStatus();
        setHasResume(res.data.hasResume);

        // If no resume and onboarding not completed, redirect to onboarding
        if (!res.data.hasResume && !res.data.onboardingCompleted) {
          navigate("/onboarding");
          return;
        }

        // Fetch jobs
        loadJobs(res.data.hasResume);
      } catch (err) {
        console.error("Failed to check resume status:", err);
        // Try loading jobs anyway
        loadJobs(false);
      }
    }

    if (isAuthenticated) {
      checkOnboarding();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadJobs = async (useMatching) => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (useMatching) {
        // Use AI-matched jobs
        response = await fetchMatchedJobs({
          limit: 20,
          excludeSeen: true,
        });
        setJobs(response.data.jobs || []);
      } else {
        // Fallback to regular jobs
        response = await fetchJobs({
          limit: 20,
          excludeSeen: "true",
        });
        setJobs(response.data.jobs || []);
      }

    } catch (err) {
      console.error("Failed to load jobs:", err);
      if (err.response?.data?.needsResume) {
        navigate("/onboarding");
        return;
      }
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (saving) return;

    const currentJob = jobs[currentIndex];
    if (!currentJob) return;

    setSaving(true);
    try {
      await likeJob(currentJob._id, "swipe");
    } catch (err) {
      console.error("Failed to like job:", err);
    } finally {
      setSaving(false);
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSkip = async () => {
    if (saving) return;

    const currentJob = jobs[currentIndex];
    if (!currentJob) return;

    setSaving(true);
    try {
      await skipJob(currentJob._id, "swipe");
    } catch (err) {
      console.error("Failed to skip job:", err);
    } finally {
      setSaving(false);
      setCurrentIndex(i => i + 1);
    }
  };

  const handleLoadMore = async () => {
    setCurrentIndex(0);
    await loadJobs(hasResume);
  };

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  // Show loading while checking auth
  if (authLoading || hasResume === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Subheader */}
      <div className="bg-white border-b">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {hasResume ? "AI-Matched Jobs" : "Discover Opportunities"}
              </p>
              {hasResume && (
                <p className="text-xs text-gray-400">
                  Personalized based on your resume
                </p>
              )}
            </div>
            {jobs.length > 0 && currentIndex < jobs.length && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {jobs.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-3 border-black border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Finding your best matches...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadJobs(hasResume)}
              className="px-6 py-3 bg-black text-white rounded-full text-sm hover:opacity-90 transition"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 text-lg mb-2">No jobs found</p>
            <p className="text-gray-500 text-sm mb-6">
              Try updating your resume or check back later
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-6 py-3 bg-black text-white rounded-full text-sm hover:opacity-90 transition"
            >
              Update Resume
            </button>
          </div>
        ) : currentIndex >= jobs.length ? (
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">
              You've seen all today's matches!
            </h3>
            <p className="text-gray-500 mb-6">
              Come back tomorrow for more opportunities, or check your saved jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-black text-white rounded-full text-sm hover:opacity-90 transition"
              >
                Load More Jobs
              </button>
              <button
                onClick={() => navigate("/saved")}
                className="px-6 py-3 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition"
              >
                View Saved Jobs
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl">
            {/* Next card peek */}
            {nextJob && (
              <div className="absolute inset-0 translate-y-2 scale-[0.97] rounded-2xl bg-white border shadow-sm -z-10" />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentJob._id}
                drag="x"
                style={{ x, rotate }}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 120) handleLike();
                  else if (info.offset.x < -120) handleSkip();
                  x.set(0);
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                className="relative touch-pan-x cursor-grab active:cursor-grabbing"
              >
                {/* Skip Indicator */}
                <motion.div
                  className="absolute top-6 left-6 z-10 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg"
                  style={{ opacity: leftOpacity }}
                >
                  <span className="flex items-center gap-1 font-medium">
                    ✕ Skip
                  </span>
                </motion.div>

                {/* Like Indicator */}
                <motion.div
                  className="absolute top-6 right-6 z-10 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
                  style={{ opacity: rightOpacity }}
                >
                  <span className="flex items-center gap-1 font-medium">
                    ♥ Like
                  </span>
                </motion.div>

                <JobCard job={currentJob} />
              </motion.div>
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={handleSkip}
                disabled={saving}
                className="w-16 h-16 rounded-full border-2 border-red-200 bg-white text-red-500 flex items-center justify-center hover:bg-red-50 hover:border-red-300 active:scale-95 transition disabled:opacity-50"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={handleLike}
                disabled={saving}
                className="w-16 h-16 rounded-full border-2 border-green-200 bg-white text-green-500 flex items-center justify-center hover:bg-green-50 hover:border-green-300 active:scale-95 transition disabled:opacity-50"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

            {/* Keyboard shortcuts hint */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Swipe or use ← → keys
            </p>
          </div>
        )}
      </main>

      {/* Keyboard controls */}
      <KeyboardHandler onLeft={handleSkip} onRight={handleLike} />
    </div>
  );
}

// Keyboard handler component
function KeyboardHandler({ onLeft, onRight }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        onLeft();
      } else if (e.key === "ArrowRight") {
        onRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLeft, onRight]);

  return null;
}
