import JobApplication from "../models/JobApplication.js";
import { generateToken } from "../utils/jwt.js";

//@route GET /api/v1/assessment/validate
export const validateAssessment = async (req, res) => {
  try {
    const { userId, jobId, assessmentCode } = req.user;

    console.log(req.user);
    if (!userId || !jobId || !assessmentCode)
      return res.status(401).json({ message: "No token provided" });

    const application = await JobApplication.findOne({
      userId,
      jobId,
      "assessment.assessmentCode": assessmentCode,
    });

    if (!application) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    if (!application.assessment.scheduled) {
      return res.status(403).json({ message: "Assessment not scheduled" });
    }

    const now = new Date();
    const scheduledDateTime = new Date(
      application.assessment.scheduledDateTime
    );

    const response = {
      message:
        now < scheduledDateTime
          ? "Assessment not available"
          : "Assessment ready",
      scheduledDateTime: application.assessment.scheduledDateTime,
      status: application.status,
      assessment: {
        scheduled: application.assessment.scheduled,
        taken: application.assessment.taken,
        passed: application.assessment.passed,
        overallScore: application.assessment.overallScore || null,
      },
    };

    if (response.message === "Assessment ready") {
      const token = generateToken({ _id: userId, role: "candidate" }, "50m");
      console.log("Token generated for assessment", token);
      response.token = token;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occured while validating the assessment.", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
