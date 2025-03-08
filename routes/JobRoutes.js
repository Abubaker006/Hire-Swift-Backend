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

const router = express.Router();

router.use(protect);

router.route("/").post(createJobPosting).get(getAllJobPosting);

router
  .route("/:id")
  .get(getJobPost)
  .put(updateJobPosting)
  .delete(deleteJobPosting);

router.route("/:id/status").patch(updateJobPostingStatus);

export default router;
