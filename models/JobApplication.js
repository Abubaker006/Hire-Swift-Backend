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
      "assessment_missed",
      "assessment_started",
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
    isStarted: { type: Boolean, default: false },
    startTime: { type: Date },
    completedDate: { type: Date },
    assessmentCode: {
      type: String,
      unique: true,
    },
    assessmentLink: { type: String },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, required: true },
        difficulty: { type: String, required: true },
        classification: { type: String, required: true },
        timeLimit: { type: Number, required: true },
        id: { type: Number, required: true },
        index: { type: Number, required: true, default: 0 },
        isSubmitted: { type: Boolean, default: false },
        total: { type: Number, default: 0 },
        correct: { type: Boolean, default: false },
        submittedAnswer: [{ answer: String, language: String }],
      },
    ],

    overallScore: { type: Number, min: 0, max: 100 },
    passed: { type: Boolean, default: false },
    lastActivity: { type: Date },
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

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;

// codingQuestions: {
//   total: { type: Number, default: 0 },
//   correct: { type: Number, default: 0 },
//   score: { type: Number, min: 0, max: 100 },
//   submittedCode: [{ questionId: String, code: String, language: String }],
//   questions: [{ questionId: String, question: String }],
// },
// theoryQuestions: {
//   total: { type: Number, default: 0 },
//   correct: { type: Number, default: 0 },
//   score: { type: Number, min: 0, max: 100 },
//   answers: [{ questionId: String, answer: String }],
//   questions: [{ questionId: String, question: String }],
// },
