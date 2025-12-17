import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  applyUrl: String,
  source: String,
  tags: [String],
  salary: String,
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  founders: [
    {
      name: String,
      role: String,
      bio: String,
      linkedin: String
    }
  ],
  companyDescription: String,
  ycSlug: String
  
});

JobSchema.index({ title: "text", company: "text" });
JobSchema.index({ scrapedAt: -1 });
JobSchema.index({ source: 1 });

JobSchema.index(
    { title: 1, company: 1, applyUrl: 1 },
    { unique: true }
  );
  

export default mongoose.model("Job", JobSchema);
