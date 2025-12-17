import { useState } from "react";

export default function JobCard({ job }) {
  // Detect startup vs MNC (safe heuristic for v1)
  const isPremium = false;

  const isStartup =
    job.company &&
    !job.company.toLowerCase().includes("google") &&
    !job.company.toLowerCase().includes("microsoft") &&
    !job.company.toLowerCase().includes("amazon") &&
    !job.company.toLowerCase().includes("meta") &&
    !job.company.toLowerCase().includes("apple");

  const hasFounders =
    Array.isArray(job.founders) && job.founders.length > 0;

  const showFounderTab = isStartup;

  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-xl bg-black text-white flex items-center justify-center text-xl font-semibold">
          {job.company?.[0] || "C"}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{job.company}</h2>
          <p className="text-sm text-gray-500">{job.title}</p>
        </div>

        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          92% match
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mt-6">
        <button
          onClick={() => setActiveTab("company")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "company"
              ? "border-b-2 border-black text-black"
              : "text-gray-400"
          }`}
        >
          Company
        </button>

        {showFounderTab && (
          <button
            onClick={() => setActiveTab("founders")}
            className={`pb-2 text-sm font-medium transition ${
              activeTab === "founders"
                ? "border-b-2 border-black text-black"
                : "text-gray-400"
            }`}
          >
            Founders & Insights
          </button>
        )}
      </div>

      {/* Company Tab */}
      {activeTab === "company" && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {job.title} role at {job.company}.
            {job.location
              ? ` Based in ${job.location}.`
              : " Remote-friendly position."}
            {job.tags?.length
              ? ` Tech stack includes ${job.tags.slice(0, 3).join(", ")}.`
              : ""}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-medium">{job.location || "Remote"}</p>
            </div>

            <div>
              <p className="text-gray-400">Type</p>
              <p className="font-medium">Full-time</p>
            </div>

            <div>
              <p className="text-gray-400">Experience</p>
              <p className="font-medium">1–3 yrs</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {job.tags?.slice(0, 6).map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Founders / Insights Tab */}
      {showFounderTab && activeTab === "founders" && (
        <div className="mt-4 space-y-4">
          {hasFounders ? (
            job.founders.map((f, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-start p-3 rounded-xl border bg-gray-50"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-medium">
                  {f.name?.[0] || "F"}
                </div>

                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {f.bio}
                  </p>

                  <span className="inline-block mt-1 text-xs text-gray-400">
                    Founder
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">
                Founder insights
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Access signals about the founding team’s background,
                experience, and company-building journey.
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Available with Foundwell Premium.
              </p>

              <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">
                Unlock Premium
              </button>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <a
        href={job.url}
        target="_blank"
        rel="noreferrer"
        className="block text-center mt-6 bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
      >
        View Opportunity
      </a>
    </div>
  );
}
