import express from "express";
import {
  recordAssessmentReport,
  validateAssessmentReport,
} from "../controllers/blockchainController.js";
import { protect } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/record-to-blockchain")
  .post(authorizeRoles("candidate"), recordAssessmentReport);
router
  .route("/validate-assessment-report")
  .post(authorizeRoles("recruiter"), validateAssessmentReport);

export default router;
