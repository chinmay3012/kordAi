import { useState } from "react";

/**
 * JobCard Component
 * Redesigned to match FurtherAI job listings interface.
 * Horizontal layout on desktop, stacked on mobile.
 */
export default function JobCard({ job }) {
  // Founders are now unlocked for everyone per request
  const foundersUnlocked = true;

  // Formatters
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} hours ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    if (salary.displayText) return salary.displayText;
    if (salary.min && salary.max) {
      return `$${Math.round(salary.min / 1000)}K - $${Math.round(salary.max / 1000)}K`;
    }
    return null;
  };

  const companyName = job.company?.name || job.companyName || "Unknown Company";
  const ycBatch = job.company?.ycBatch || job.batch;
  const salaryDisplay = formatSalary(job.salary) || job.salaryText;
  const postedAtDisplay = job.postedAt ? `Posted ${formatTimeAgo(job.postedAt)}` : (job.postedTime || "Recently posted");
  const equityDisplay = job.salary?.equity || (job.equityRange ? `${job.equityRange.min}% - ${job.equityRange.max}%` : null);

  // Experience display
  const experienceDisplay = {
    "intern": "Internship preferred",
    "entry": "0-2 years preferred",
    "mid": "3+ years preferred",
    "senior": "5+ years preferred",
    "lead": "8+ years preferred",
    "executive": "10+ years preferred",
  }[job.experienceLevel] || job.experienceLevel || "Experience preferred";

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
    <article className="group bg-white rounded-[16px] border border-[#e5e5e5] shadow-sm hover:shadow-lg transition-all duration-300 w-full overflow-hidden mb-6 relative">
      {/* Fresh Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-[#10b981] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          Fresh
        </span>
      </div>
      {/* 1. Top Section: Job Info & Apply */}
      <div className="p-[24px] md:p-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[20px] border-b border-[#f0f0f0]">

        {/* Left Side: Title & Info */}
        <div className="flex flex-col gap-[10px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[20px] md:text-[22px] font-bold text-[#1a1a1a] leading-tight">
              {job.title} <span className="font-semibold text-[#4F7CFF]">at {companyName}</span>
              {ycBatch && <span className="text-[#666] font-medium ml-2 text-[16px]">({ycBatch})</span>}
            </h2>
          </div>

          <p className="text-[13px] text-[#888888] font-medium uppercase tracking-wider">
            {postedAtDisplay}
          </p>

          <div className="flex flex-wrap items-center gap-[10px] text-[14px] md:text-[15px] text-[#444444] font-semibold mt-[4px]">
            <span className="bg-[#f0f4ff] text-[#4F7CFF] px-3 py-1 rounded-full">{typeDisplay}</span>
            {salaryDisplay && (
              <span className="bg-[#ecfdf5] text-[#10b981] px-3 py-1 rounded-full">{salaryDisplay}</span>
            )}
            {equityDisplay && (
              <span className="bg-[#fff7ed] text-[#f59e0b] px-3 py-1 rounded-full">{equityDisplay} Equity</span>
            )}
            <span className="bg-[#f3f4f6] text-[#6b7280] px-3 py-1 rounded-full">{experienceDisplay}</span>
          </div>

          {job.location && (
            <div className="flex items-center gap-1.5 text-[14px] text-[#666] mt-1">
              <span className="text-[16px]">📍</span>
              <span>{job.location}</span>
              {job.locationType && <span className="text-[#999] ml-1 uppercase text-[12px] font-bold tracking-tight">({job.locationType})</span>}
            </div>
          )}
        </div>

        {/* Right Side: Primary Action */}
        <div className="w-full md:w-auto self-stretch md:self-center flex items-center">
          <a
            href={job.applyUrl || job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-[8px] bg-[#4F7CFF] hover:bg-[#3d6bec] active:scale-[0.98] text-white text-[16px] font-bold px-[32px] py-[14px] rounded-[12px] transition-all duration-200 w-full shadow-md hover:shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* 2. Middle Section: Slogan & About */}
      {(job.company?.slogan || job.company?.about || job.company?.description) && (
        <div className="px-[24px] md:px-[32px] py-[24px] bg-[#fcfcfc] flex flex-col gap-[16px] border-b border-[#f0f0f0]">
          {job.company?.slogan && (
            <div className="flex flex-col gap-1">
              <h4 className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Company Slogan</h4>
              <p className="text-[17px] md:text-[18px] font-medium text-[#1a1a1a] italic leading-relaxed">
                "{job.company.slogan}"
              </p>
            </div>
          )}

          {(job.company?.about || job.company?.description) && (
            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-bold text-[#999] uppercase tracking-widest">About the Company</h4>
              <p className="text-[15px] text-[#4a4a4a] leading-[1.6] whitespace-pre-line">
                {job.company.about || job.company.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Bottom Section: Founders (Vertical Stack) */}
      {hasFounders && foundersUnlocked && (
        <div className="px-[24px] md:px-[32px] py-[28px] bg-white">
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#4F7CFF] uppercase tracking-[0.1em] mb-[20px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F7CFF] animate-pulse"></span>
            Meet the Founding Team
          </div>

          <div className="flex flex-col gap-4">
            {job.founders.map((founder, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-[18px] rounded-[16px] bg-[#f9fafb] border border-[#f0f0f0] transition-colors hover:bg-[#f3f4f6]"
              >
                <div className="relative">
                  {founder.imageUrl ? (
                    <img
                      src={founder.imageUrl}
                      alt={founder.name}
                      className="w-[56px] h-[56px] rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-[56px] h-[56px] rounded-full bg-[#e5e7eb] flex items-center justify-center text-[20px] font-bold text-[#9ca3af] border-2 border-white shadow-sm">
                      {founder.name?.[0] || 'F'}
                    </div>
                  )}
                  {founder.linkedin && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                      <div className="text-[#0077b5]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold text-[#1a1a1a] mb-0.5">{founder.name}</p>
                  <p className="text-[14px] text-[#666] font-medium">{founder.role || "Founder"}</p>
                  {founder.bio && (
                    <p className="text-[13px] text-[#888] mt-2 line-clamp-2 italic leading-snug">
                      {founder.bio}
                    </p>
                  )}
                </div>

                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full text-[#9ca3af] hover:text-[#0077b5] hover:bg-white transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
