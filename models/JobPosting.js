import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  jobType: {
    type: String,
    required: true,
    enum: ["internship", "full-time", "part-time", "contract", "temporary"],
  },
  locationType: {
    type: String,
    required: true,
    enum: ["remote", "onsite", "hybrid"],
  },
  locationDetails: { type: String },
  team: { type: String },
  description: { type: String, required: true },
  requiredQualification: { type: String, required: true },
  prefferedQualification: { type: String },
  techStack: { type: [String], default: [], required: true },
  compensation: {
    min: { type: Number },
    max: { type: Number },
    type: { type: String, enum: ["hourly", "salary", "DOE"] },
  },
  applicationDeadLine: { type: Date },
  startDate: { type: Date },
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
  numberOfCandidatesRequired: { type: Number, default: 1 },
});
 
export default mongoose.model("JobPosting", JobPostingSchema);
