import express from "express";
import {
  validateAssessment,
  startAssessment,
  submitAssessmentAnswer,
  startAssessmentEvaluation,
} from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/validate").get(validateAssessment);

router.route("/start-assessment").post(startAssessment);
router.route("/submit-answer").post(submitAssessmentAnswer);
router.route("/start-evaluation").post(startAssessmentEvaluation);

export default router;
