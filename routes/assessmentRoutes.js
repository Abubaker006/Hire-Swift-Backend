import express from "express";
import {
  validateAssessment,
  startAssessment,
  submitAssessmentAnswer,
  startAssessmentEvaluation,
  generateAssessmentReport,
  getAllAssessments,
} from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/validate").get(validateAssessment);

router.route("/start-assessment").post(startAssessment);
router.route("/submit-answer").post(submitAssessmentAnswer);
router.route("/start-evaluation").post(startAssessmentEvaluation);
router.route("/generate-report").post(generateAssessmentReport);
router
  .route("/get-all-assessments")
  .get(authorizeRoles("recruiter", "candidate"), getAllAssessments);

export default router;
