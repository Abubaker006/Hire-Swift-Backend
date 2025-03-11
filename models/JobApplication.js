import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: [
      "applied",
      "shortlisted",
      "assessment_scheduled",
      "assessment_taken",
      "assessment_passed",
      "assessment_failed",
      "interview_scheduled",
      "interview_completed",
      "offer_made",
      "hired",
      "rejected",
    ],
    default: "applied",
    index: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },

  assessment: {
    scheduled: { type: Boolean, default: false },
    scheduledDateTime: { type: Date },
    taken: { type: Boolean, default: false },
    completedDate: { type: Date },
    assessmentCode: { type: String, unique: true },
    assessmentLink: { type: String },
    codingQuestions: {
      total: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      score: { type: Number, min: 0, max: 100 },
      submittedCode: [{ questionId: String, code: String, language: String }],
    },
    theoryQuestions: {
      total: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      score: { type: Number, min: 0, max: 100 },
      answers: [{ questionId: String, answer: String }],
    },
    overallScore: { type: Number, min: 0, max: 100 },
    passed: { type: Boolean, default: false },
  },

  interview: {
    scheduled: { type: Boolean, default: false },
    interviewDate: { type: Date },
    completed: { type: Boolean, default: false },
    feedback: { type: String },
  },

  offer: {
    offered: { type: Boolean, default: false },
    accepted: { type: Boolean, default: false },
    offerLetterUrl: { type: String },
  },

  additionalInfo: { type: String },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

jobApplicationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("JobApplication", jobApplicationSchema);
