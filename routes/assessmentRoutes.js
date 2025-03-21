import express from "express";
import {
  validateAssessment,
  startAssessment,
  submitAssessmentAnswer,
} from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/validate").get(validateAssessment);

router.route("/start-assessment").post(startAssessment);
router.route("/submit-answer").post(submitAssessmentAnswer);

export default router;
