import { useState } from "react";

export default function JobCard({ job }) {
  const [activeTab, setActiveTab] = useState("company");

  // Get company name (handle new and legacy format)
  const companyName = job.company?.name || job.companyName || job.company || "Unknown Company";
  const companyLogo = job.company?.logo;
  const companyDescription = job.company?.description || job.companyDescription;

  // Get match score
  const matchScore = job.matchScore || null;

  // Detect startup vs MNC
  const isStartup =
    companyName &&
    !companyName.toLowerCase().includes("google") &&
    !companyName.toLowerCase().includes("microsoft") &&
    !companyName.toLowerCase().includes("amazon") &&
    !companyName.toLowerCase().includes("meta") &&
    !companyName.toLowerCase().includes("apple") &&
    !companyName.toLowerCase().includes("netflix");

  const hasFounders = Array.isArray(job.founders) && job.founders.length > 0;
  const showFounderTab = isStartup;

  // Get salary display
  const salaryDisplay = job.salary?.displayText || job.salaryText || job.salary?.min
    ? (job.salary?.min && job.salary?.max
      ? `$${(job.salary.min / 1000).toFixed(0)}k - $${(job.salary.max / 1000).toFixed(0)}k`
      : job.salaryText)
    : null;

  // Get experience level display
  const experienceDisplay = {
    "intern": "Internship",
    "entry": "Entry Level (0-2 yrs)",
    "mid": "Mid Level (2-5 yrs)",
    "senior": "Senior (5+ yrs)",
    "lead": "Lead / Principal",
    "executive": "Executive",
  }[job.experienceLevel] || "Not specified";

  // Get location type display
  const locationTypeDisplay = {
    "remote": "🌍 Remote",
    "hybrid": "🏢 Hybrid",
    "onsite": "📍 On-site",
  }[job.locationType] || job.location || "Remote";

  // Get job type display
  const jobTypeDisplay = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    "contract": "Contract",
    "internship": "Internship",
    "freelance": "Freelance",
  }[job.type] || "Full-time";

  // Match score color
  const getMatchColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="bg-white rounded-3xl border shadow-xl overflow-hidden select-none flex flex-col w-full">
      {/* Header Section */}
      <div className="p-6 pb-2">
        <div className="flex items-start gap-4">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="h-16 w-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-sm ${companyLogo ? "hidden" : ""
              }`}
          >
            {companyName?.[0]?.toUpperCase() || "C"}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate tracking-tight text-gray-900">
              {companyName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium text-gray-500 truncate">
                {job.title}
              </p>
              {job.company?.ycBatch && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#F26522] text-white tracking-wide uppercase">
                  YC {job.company.ycBatch}
                </span>
              )}
            </div>
          </div>

          {/* Match Score */}
          {matchScore !== null && (
            <div className="flex flex-col items-center">
              <div
                className={`text-lg font-bold px-3 py-1 rounded-xl whitespace-nowrap shadow-sm ${getMatchColor(
                  matchScore
                )}`}
              >
                {matchScore}%
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">
                Match
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 uppercase font-bold block mb-1">
              Location
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {locationTypeDisplay}
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 uppercase font-bold block mb-1">
              Salary
            </span>
            <span className="text-sm font-semibold text-green-600">
              {salaryDisplay || "Competitive"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mt-6">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "company"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            Company
          </button>
          {job.matchDetails && (
            <button
              onClick={() => setActiveTab("match")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "match"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Analytics
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-4 min-h-[120px]">
          {activeTab === "company" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {job.shortDescription ||
                  companyDescription ||
                  job.description ||
                  "Join a fast-growing team solving hard problems."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(job.tags || ["Startup", "Tech"]).slice(0, 5).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "match" && job.matchDetails && (
            <div className="space-y-3">
              {/* Detailed Match Breakdown */}
              {Object.entries(job.matchDetails).map(([key, data]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold capitalize text-gray-700">
                      {key} Match
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Based on {key === "experience" ? "level" : "keywords"}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    +{data.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOUNDER CARDS SECTION (Attached Below) */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Founding Team
          </h3>
          {hasFounders && (
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ACTIVE
            </span>
          )}
        </div>

        {hasFounders ? (
          <div className="space-y-4">
            {job.founders.slice(0, 2).map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-4">
                  {f.imageUrl ? (
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="h-12 w-12 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {f.name?.[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{f.name}</h4>
                    <p className="text-xs font-medium text-gray-500">
                      {f.role || "Co-Founder"}
                    </p>
                    <div className="flex gap-3 mt-2">
                      {f.linkedin && (
                        <a
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#0077b5] transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                      )}
                      {f.twitter && (
                        <a
                          href={f.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#1DA1F2] transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {f.bio && (
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {f.bio}
                  </p>
                )}

                {/* Contact Founder Button */}
                <a
                  href={`mailto:${f.email || job.applyEmail || "founders@company.com"}`}
                  className="mt-3 block w-full py-2 bg-black text-white text-xs font-bold uppercase rounded-lg text-center hover:opacity-80 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  Contact Founder
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-200 border-dashed text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">🕵️‍♂️</div>
            <p className="text-sm font-bold text-gray-900">Founder info locked</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">Upgrade to Premium to unlock founder signals and direct contact.</p>
            <button className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold">Unlock Data</button>
          </div>
        )}
      </div>

      {/* Main CTA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl text-center shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
