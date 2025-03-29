import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema({
  questionId: Number,
  score: Number,
  category: String,
  feedback: String,
});

const QuestionSchema = new mongoose.Schema({
  questionId: Number,
  topics: [String],
  suggestion: String,
});

const AssessmentReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPosting",
    required: true,
  },
  assessmentCode: { type: String, required: true, unique: true },
  totalScore: Number,
  evaluation: [EvaluationSchema],
  rightQuestions: {
    questionIds: [Number],
    strongTopics: [String],
  },
  wrongQuestions: [QuestionSchema],
  averageQuestions: [QuestionSchema],
  parameters: {
    concept: Number,
    clarity: Number,
    accuracy: Number,
    knowledge: Number,
    codeQuality: Number,
    problemSolving: Number,
  },
  observation: {
    summary: String,
    keyStrengths: [String],
    keyWeaknesses: [String],
    nextSteps: String,
    codeQualityFeedback: String,
    problemSolvingFeedback: String,
  },
});

export default mongoose.model("AssessmentReport", AssessmentReportSchema);
