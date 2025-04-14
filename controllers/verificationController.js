import Proctoring from "../models/Proctoring.js";
import JobApplication from "../models/JobApplication.js";

//@route POST /api/v1/verification/post-verification-data
export const postFaceDescriptions = async (req, res) => {
  try {
    const { userId, jobId, assessmentCode } = req.user;
    const { descriptor } = req.body;

    if (!descriptor || descriptor.length === 0)
      return res.status(400).json({ message: "Descriptor is missing" });

    const jobApp = await JobApplication.findOne({ userId, jobId });

    if (!jobApp)
      return res.status(404).json({ message: "Job application not found" });

    const existingProctor = await Proctoring.findOne({
      userId,
      jobId: jobApp._id,
    });

    const now = new Date();
    const scheduledTime = new Date(jobApp.scheduledDateTime);
    const graceTime = new Date(scheduledTime.getTime() + 5 * 60 * 1000);

    if (existingProctor) {
      if (graceTime <= now) {
        await Proctoring.deleteOne({ _id: existingProctor._id });
      } else {
        return res
          .status(200)
          .json({ message: "Face Descriptor already exists" });
      }
    }

    const proctorData = new Proctoring({
      userId: userId,
      jobId: jobApp._id,
      descriptor,
    });
    await proctorData.save();
    res.status(201).json({ message: "Face descriptor saved." });
  } catch (error) {
    console.error("Error at posting face description", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/v1/verification/report-violation
export const reportViolation = async (req, res) => {
  try {
    const { reason } = req.body;
    const { userId, jobId } = req.user;

    if (!reason)
      return res.status(400).json({ message: "Violation reason is required" });

    const jobApp = await JobApplication.findOne({ userId, jobId });

    if (!jobApp)
      return res.status(404).json({ message: "Job application not found" });

    const proctorData = await Proctoring.findOne({
      jobApplicationId: jobApp._id,
    });

    if (!proctorData)
      return res.status(404).json({ message: "No proctoring session found" });

    proctorData.violations.count += 1;
    proctorData.violations.logs.push({ reason });

    if (proctorData.violations.count >= 3) {
      proctorData.isTampered = true;
    }

    await proctorData.save();

    res.status(200).json({ message: "Violation recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//@route GET /api/v1/verification/get-descriptor
export const getDescriptor = async (req, res) => {
  try {
    const { userId, jobId } = req.user;
    const jobApp = await JobApplication.findOne({ userId, jobId });

    if (!jobApp)
      return res.status(404).json({ message: "Job application not found" });

    const proctorData = await Proctoring.findOne({
      userId: userId,
      jobId: jobApp._id,
    });

    if (!proctorData || !proctorData.descriptor) {
      return res.status(404).json({ message: "Descriptor not found" });
    }

    res.status(200).json({
      message: "Discription data extracted sucessfully.",
      descriptor: proctorData.descriptor,
    });
  } catch (err) {
    console.error("Error fetching descriptor", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
