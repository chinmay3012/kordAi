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
    <article className="group bg-white rounded-[12px] border border-[#e5e5e5] shadow-sm hover:shadow-md hover:bg-[#f8f9fa] transition-all duration-200 w-full overflow-hidden mb-4 relative">
      {/* Main Container */}
      <div className="p-[20px] md:p-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px] md:gap-[20px]">

        {/* Left Side: Content Section */}
        <div className="flex flex-col gap-[8px] flex-1">

          {/* 1. Job Title Section */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] md:text-[18px] font-bold text-[#1a1a1a] leading-snug">
              {job.title} <span className="font-semibold text-[#1a1a1a]">at {companyName}</span>
              {ycBatch && <span className="text-[#666] font-medium ml-1">({ycBatch})</span>}
            </h2>
          </div>

          {/* 2. Post Time */}
          <p className="text-[12px] md:text-[13px] text-[#666666] font-normal">
            {postedAtDisplay}
          </p>

          {/* 3. Job Details Row */}
          <div className="flex flex-wrap items-center gap-[6px] md:gap-[8px] text-[13px] md:text-[14px] text-[#444444] font-medium mt-[4px]">
            <span>{typeDisplay}</span>
            <span className="text-[#ccc">•</span>
            {salaryDisplay && (
              <>
                <span>{salaryDisplay}</span>
                <span className="text-[#ccc">•</span>
              </>
            )}
            {equityDisplay && (
              <>
                <span>{equityDisplay} Equity</span>
                <span className="text-[#ccc">•</span>
              </>
            )}
            <span>{experienceDisplay}</span>
          </div>

          {/* 4. Additional Metadata */}
          {(job.location || job.locationType || job.department) && (
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#999999] mt-[2px]">
              {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
              {job.locationType && <span className="capitalize">({job.locationType})</span>}
              {job.department && <span>Team: {job.department}</span>}
            </div>
          )}
        </div>

        {/* Right Side: Action Button */}
        <div className="w-full md:w-auto mt-[8px] md:mt-0">
          <a
            href={job.applyUrl || job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Apply for ${job.title} at ${companyName}`}
            className="flex items-center justify-center gap-[6px] bg-[#4F7CFF] hover:bg-[#3d6bec] active:scale-[0.97] text-white text-[14px] font-semibold px-[20px] py-[10px] rounded-[8px] transition-all duration-200 w-full md:w-auto shadow-sm hover:shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
            <svg
              className="w-[14px] h-[14px]"
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

      {/* Founder Section - Integrated into card, visible for all */}
      {hasFounders && foundersUnlocked && (
        <div className="px-[20px] md:px-[24px] pb-[20px] pt-0">
          <div className="border-t border-[#e5e5e5] pt-[16px]">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#999999] uppercase tracking-[0.05em] mb-[12px]">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Founding Team
            </div>
            <div className="flex flex-wrap gap-4">
              {job.founders.map((founder, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-[8px] bg-[#f8f9fa] border border-[#e5e5e5] min-w-[180px]">
                  {founder.imageUrl ? (
                    <img src={founder.imageUrl} alt={founder.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#e5e5e5] flex items-center justify-center text-[12px] font-bold text-[#666]">
                      {founder.name?.[0] || 'F'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{founder.name}</p>
                    <p className="text-[11px] text-[#666] truncate">{founder.role || "Founder"}</p>
                  </div>
                  {founder.linkedin && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#999999] hover:text-[#0077b5] transition-colors"
                      title={`${founder.name}'s LinkedIn`}
                    >
                      <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
