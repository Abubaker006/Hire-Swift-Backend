import express from "express";
import {
  getDescriptor,
  postFaceDescriptions,
  reportViolation,
} from "../controllers/verificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/post-verification-data").post(postFaceDescriptions);

router.route("/report-violation").post(reportViolation);

router.route("/get-descriptor").get(getDescriptor);

export default router;
