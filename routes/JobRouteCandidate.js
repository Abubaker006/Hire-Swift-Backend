import express from "express";
import {
  applyToJobPosting,
  getAllCandidateJobPostings,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/:id/apply").post(applyToJobPosting);
router.route("/").get(getAllCandidateJobPostings);

export default router;
