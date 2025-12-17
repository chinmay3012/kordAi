export default function SavedJobs() {
    const saved =
      JSON.parse(localStorage.getItem("likedJobs")) || [];
  
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">
          Saved Opportunities
        </h1>
  
        {saved.length === 0 ? (
          <p className="text-gray-500">
            No saved jobs yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {saved.map(job => (
              <div
                key={job._id}
                className="border rounded-xl p-4 bg-white"
              >
                <h2 className="font-medium">{job.title}</h2>
                <p className="text-sm text-gray-500">
                  {job.company}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  