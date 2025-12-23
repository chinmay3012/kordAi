import { useState } from "react";

export default function JobCard({ job }) {
  // Always unlock founders for all users temporarily
  const foundersUnlocked = true;

  // Get company name
  const companyName = job.company?.name || job.companyName || "Unknown Company";
  const companyLogo = job.company?.logo;

  // Formatters
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    if (salary.displayText) return salary.displayText;
    if (salary.min && salary.max) {
      return `$${(salary.min / 1000).toFixed(0)}k - $${(salary.max / 1000).toFixed(0)}k`;
    }
    return null;
  };

  const salaryDisplay = formatSalary(job.salary) || job.salaryText;
  const postedAtDisplay = job.postedAt ? `Posted ${formatTimeAgo(job.postedAt)}` : "";
  const equityDisplay = job.salary?.equity ? job.salary.equity : null;

  // Experience display
  const experienceDisplay = {
    "intern": "Internship",
    "entry": "Entry Level",
    "mid": "Mid Level",
    "senior": "Senior",
    "lead": "Lead",
    "executive": "Executive",
  }[job.experienceLevel] || job.experienceLevel || "Experience not specified";

  // Employment type display
  const typeDisplay = {
    "full-time": "Full-Time",
    "part-time": "Part-Time",
    "contract": "Contract",
    "internship": "Internship",
    "freelance": "Freelance",
  }[job.type] || "Full-Time";

  const hasFounders = Array.isArray(job.founders) && job.founders.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full overflow-hidden mb-4">
      {/* Main Horizontal Content */}
      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Left Side: Content */}
        <div className="flex items-start gap-4 flex-1">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="h-12 w-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`h-12 w-12 rounded-lg bg-gradient-to-br from-gray-700 to-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0 ${companyLogo ? "hidden" : ""
              }`}
          >
            {companyName?.[0]?.toUpperCase() || "C"}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[17px] font-bold text-black leading-tight">
                {job.title}
              </h2>
              <span className="text-gray-400 font-normal">at</span>
              <span className="text-gray-900 font-semibold">{companyName}</span>
              {job.company?.ycBatch && (
                <span className="bg-[#F26522] text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                  YC {job.company.ycBatch}
                </span>
              )}
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-500 font-medium">
              {postedAtDisplay && (
                <>
                  <span>{postedAtDisplay}</span>
                  <span className="text-gray-300">•</span>
                </>
              )}
              <span>{typeDisplay}</span>
              <span className="text-gray-300">•</span>

              {salaryDisplay && (
                <>
                  <span className="text-gray-700">{salaryDisplay}</span>
                  <span className="text-gray-300">•</span>
                </>
              )}

              {equityDisplay && (
                <>
                  <span className="text-gray-700">{equityDisplay}</span>
                  <span className="text-gray-300">•</span>
                </>
              )}

              <span>{experienceDisplay}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Action Button */}
        <div className="mt-2 md:mt-0 w-full md:w-auto flex-shrink-0">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#4F7CFF] hover:bg-[#3d6bec] text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg transition-all active:scale-95 w-full md:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Founders Section (Always Visible if consistent with 'Unlock' request) */}
      {/* We keep this subtle to maintain the clean horizontal look of the main card */}
      {hasFounders && foundersUnlocked && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-gray-100 pt-3 mt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Founding Team
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {job.founders.map((founder, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  {founder.imageUrl ? (
                    <img src={founder.imageUrl} alt={founder.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {founder.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{founder.name}</p>
                    {founder.role && <p className="text-xs text-gray-500 truncate">{founder.role}</p>}
                  </div>
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#0077b5]"
                      title="LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
