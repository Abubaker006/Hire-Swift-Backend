import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, requried: true },
  jobType: {
    type: String,
    requried: true,
    enum: ["internship", "full-time", "part-time", "contract", "temporary"],
  },
  locationType: {
    type: String,
    required: true,
    enum: ["remote", "onsite", "hybrid"],
  },
  locationDetails: { type: String },
  team: { type: String },
  description: { type: String, requried: true },
  requiredQualification: { type: String, required: true },
  prefferedQualification: { type: String },
  techStack: { type: [String], default: [], required: true },
  compensation: {
    min: { type: Number },
    max: { type: Number },
    type: { type: String, enum: ["hourly", "salary", "DOE"] },
  },
  applicationDeadLine: { type: Date },
  startData: { type: Date },
  duration: { type: String }, 
  diversityStatement: { type: String },
  contactEmail: { type: String },
  status: {
    type: String,
    default: "draft",
    enum: ["draft", "published", "closed"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("JobPosting", JobPostingSchema);

// we are not including application method and application details as we will be a centralized system handling companies job posting and testing candidates. alos there can be screening questions (feature for future) but for now we will stick with ai.