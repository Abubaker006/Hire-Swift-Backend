import express from "express";
import {
  recordAssessmentReport,
  validateAssessmentReport,
} from "../controllers/blockchainController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/record-to-blockchain")
  .post(authorizeRoles("recruiter", "candidate"), recordAssessmentReport);
router
  .route("/validate-assessment-report")
  .post(authorizeRoles("recruiter"), validateAssessmentReport);
//recruiter 
export default router;
