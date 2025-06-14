import express from "express";
import {
  createJobPosting,
  getAllJobPosting,
  getJobPost,
  updateJobPosting,
  deleteJobPosting,
  updateJobPostingStatus,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireVerifiedRecruiter } from "../middleware/requireVerification.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(requireVerifiedRecruiter, createJobPosting)
  .get(getAllJobPosting);

router
  .route("/:id")
  .get(getJobPost)
  .put(requireVerifiedRecruiter, updateJobPosting)
  .delete(requireVerifiedRecruiter, deleteJobPosting);

router
  .route("/:id/status")
  .patch(requireVerifiedRecruiter, updateJobPostingStatus);

export default router;
