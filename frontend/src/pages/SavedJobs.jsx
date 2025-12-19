import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const likedJobs = JSON.parse(localStorage.getItem("likedJobs")) || [];
    setSaved(likedJobs);
  }, []);

  const handleRemove = (jobId) => {
    const updated = saved.filter(job => job._id !== jobId);
    setSaved(updated);
    localStorage.setItem("likedJobs", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all saved jobs?")) {
      setSaved([]);
      localStorage.removeItem("likedJobs");
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Saved Opportunities</h1>
            <p className="text-gray-500 text-sm mt-1">
              {saved.length} {saved.length === 1 ? "job" : "jobs"} saved
            </p>
          </div>
          {saved.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 transition"
            >
              Clear all
            </button>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-500 mb-6">
              Swipe right on jobs you're interested in to save them here.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm hover:opacity-90 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {saved.map(job => (
              <div
                key={job._id}
                className="border rounded-2xl p-6 bg-white hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg group-hover:text-black transition">
                      {job.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {job.salary}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 4 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{job.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-black text-white text-sm rounded-full hover:opacity-90 transition"
                      >
                        Apply
                      </a>
                    )}
                    <button
                      onClick={() => handleRemove(job._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Kord AI
      </footer>
    </div>
  );
}