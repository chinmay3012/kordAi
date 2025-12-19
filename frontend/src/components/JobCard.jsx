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
    <div className="bg-white rounded-2xl border shadow-sm p-6 select-none">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={companyName}
            className="h-14 w-14 rounded-xl object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-xl font-semibold ${companyLogo ? "hidden" : ""
            }`}
        >
          {companyName?.[0]?.toUpperCase() || "C"}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{companyName}</h2>
          <p className="text-sm text-gray-500 truncate">{job.title}</p>
          {job.company?.ycBatch && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              YC {job.company.ycBatch}
            </span>
          )}
        </div>

        {/* Match Score */}
        {matchScore !== null && (
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ${getMatchColor(
              matchScore
            )}`}
          >
            {matchScore}% match
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mt-6">
        <button
          onClick={() => setActiveTab("company")}
          className={`pb-2 text-sm font-medium transition ${activeTab === "company"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Company
        </button>

        {showFounderTab && (
          <button
            onClick={() => setActiveTab("founders")}
            className={`pb-2 text-sm font-medium transition ${activeTab === "founders"
                ? "border-b-2 border-black text-black"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            Founders & Insights
          </button>
        )}

        {job.matchDetails && (
          <button
            onClick={() => setActiveTab("match")}
            className={`pb-2 text-sm font-medium transition ${activeTab === "match"
                ? "border-b-2 border-black text-black"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            Why This Match
          </button>
        )}
      </div>

      {/* Company Tab */}
      {activeTab === "company" && (
        <div className="mt-4">
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {job.shortDescription || companyDescription || (
              <>
                {job.title} role at {companyName}.
                {job.location
                  ? ` Based in ${job.location}.`
                  : " Remote-friendly position."}
                {job.tags?.length
                  ? ` Tech stack includes ${job.tags.slice(0, 3).join(", ")}.`
                  : ""}
              </>
            )}
          </p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-medium">{locationTypeDisplay}</p>
            </div>

            <div>
              <p className="text-gray-400">Type</p>
              <p className="font-medium">{jobTypeDisplay}</p>
            </div>

            <div>
              <p className="text-gray-400">Experience</p>
              <p className="font-medium">{experienceDisplay}</p>
            </div>

            {salaryDisplay && (
              <div>
                <p className="text-gray-400">Salary</p>
                <p className="font-medium text-green-600">{salaryDisplay}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {job.tags.slice(0, 8).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 px-3 py-1 rounded-full capitalize"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 8 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{job.tags.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Company Info */}
          {job.company?.funding?.stage && (
            <div className="mt-5 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  💰 {job.company.funding.stage.replace("-", " ").toUpperCase()}
                </span>
                {job.company.size && (
                  <span className="text-gray-500">
                    👥 {job.company.size} employees
                  </span>
                )}
                {job.company.founded && (
                  <span className="text-gray-500">
                    📅 Founded {job.company.founded}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Founders Tab */}
      {showFounderTab && activeTab === "founders" && (
        <div className="mt-4 space-y-4">
          {hasFounders ? (
            job.founders.map((f, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-start p-4 rounded-xl border bg-gray-50"
              >
                {f.imageUrl ? (
                  <img
                    src={f.imageUrl}
                    alt={f.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-medium">
                    {f.name?.[0]?.toUpperCase() || "F"}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium">{f.name}</p>
                  {f.role && (
                    <p className="text-xs text-gray-500 mb-1">{f.role}</p>
                  )}
                  {f.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {f.bio}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2">
                    {f.linkedin && (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        LinkedIn →
                      </a>
                    )}
                    {f.twitter && (
                      <a
                        href={f.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Twitter →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <p className="text-sm font-medium text-gray-800 mb-2">
                Founder insights coming soon
              </p>
              <p className="text-sm text-gray-600">
                Unlock signals about the founding team's background, experience,
                and company-building journey.
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Available with Kord AI Premium
              </p>
            </div>
          )}
        </div>
      )}

      {/* Match Details Tab */}
      {activeTab === "match" && job.matchDetails && (
        <div className="mt-4 space-y-4">
          {/* Skills Match */}
          {job.matchDetails.skills && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">
                  Skills Match
                </span>
                <span className="text-sm text-purple-600">
                  +{job.matchDetails.skills.score} pts
                </span>
              </div>
              {job.matchDetails.skills.matched?.length > 0 && (
                <p className="text-xs text-purple-700">
                  Matching: {job.matchDetails.skills.matched.slice(0, 5).join(", ")}
                  {job.matchDetails.skills.matched.length > 5 &&
                    ` +${job.matchDetails.skills.matched.length - 5} more`
                  }
                </p>
              )}
            </div>
          )}

          {/* Role Match */}
          {job.matchDetails.roles && job.matchDetails.roles.score > 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Role Match
                </span>
                <span className="text-sm text-blue-600">
                  +{job.matchDetails.roles.score} pts
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Matching: {job.matchDetails.roles.matched?.join(", ")}
              </p>
            </div>
          )}

          {/* Experience Match */}
          {job.matchDetails.experience && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">
                  Experience Level
                </span>
                <span className="text-sm text-green-600">
                  +{job.matchDetails.experience.score} pts ({job.matchDetails.experience.match})
                </span>
              </div>
            </div>
          )}

          {/* Location Match */}
          {job.matchDetails.location && job.matchDetails.location.score > 0 && (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">
                  Location Preference
                </span>
                <span className="text-sm text-yellow-600">
                  +{job.matchDetails.location.score} pts
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {job.applyUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center mt-6 bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
          onClick={(e) => e.stopPropagation()}
        >
          View Opportunity →
        </a>
      )}
    </div>
  );
}
