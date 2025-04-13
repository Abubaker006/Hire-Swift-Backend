import mongoose from "mongoose";

const ProctoringScehma = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting",
    required: true,
  },
  descriptor: {
    type: [Number],
    required: true,
  },
  violations: {
    count: { type: Number, default: 0 },
    logs: [
      {
        timestamp: { type: Date, default: Date.now() },
      },
    ],
  },
  isTampered: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("Proctoring", ProctoringScehma);
