import express from "express";
import {
  applyToJobPosting,
  getAllCandidateJobPostings,
  getAppliedCandidateJobPosting,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/job-postings/:id/apply").post(applyToJobPosting);
router.route("/job-postings").get(getAllCandidateJobPostings);

router.route("/job-applications").get(getAppliedCandidateJobPosting);
export default router;
