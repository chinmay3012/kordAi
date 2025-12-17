import { useEffect, useState } from "react";
import { fetchJobs } from "../api/jobs";
import JobCard from "../components/JobCard";
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

  // Swipe motion value
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [-80, 0], [1, 0]);
const rightOpacity = useTransform(x, [0, 80], [0, 1]);


  useEffect(() => {
    fetchJobs()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) setJobs(data);
        else if (Array.isArray(data.jobs)) setJobs(data.jobs);
        else setJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLike = () => {
    setCurrentIndex(i => i + 1);
  };

  const handleSkip = () => {
    setCurrentIndex(i => i + 1);
  };

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-xl mx-auto px-6 py-4 text-center">
          <h1 className="text-xl font-semibold">Kord AI</h1>

          <p className="text-sm text-gray-500">
            Discover companies worth working with
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6">
        {loading ? (
          <p className="text-gray-500">Finding matches…</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found.</p>
        ) : currentIndex >= jobs.length ? (
          <p className="text-gray-500 text-center">
            🎉 You’ve reached the end of today’s matches.
          </p>
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
                style={{ x }}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 120) handleLike();
                  if (info.offset.x < -120) handleSkip();
                  x.set(0);
                }}
                initial={{ opacity: 0, y: 50}}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.55 }}
                className="relative touch-pan-x"
              >
                {/* 👎 Skip Indicator */}
                <motion.div
  className="absolute top-6 left-6 text-3xl"
  style={{ opacity: leftOpacity }}
>
  👎
</motion.div>

<motion.div
  className="absolute top-6 right-6 text-3xl"
  style={{ opacity: rightOpacity }}
>
  👍
</motion.div>


                <JobCard job={currentJob} />
              </motion.div>
            </AnimatePresence>

            {/* Action buttons (desktop-safe) */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleSkip}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
              >
                Skip
              </button>

              <button
                onClick={handleLike}
                className="px-6 py-2 rounded-full bg-black text-white hover:opacity-90 active:scale-95 transition"
              >
                Interested
              </button>
            </div>

            {/* Progress */}
            <p className="text-xs text-gray-400 text-center mt-4">
              {currentIndex + 1} of {jobs.length}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
