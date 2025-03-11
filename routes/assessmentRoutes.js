import express from "express";
import { validateAssessment } from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/validate").get(validateAssessment);

export default router;
