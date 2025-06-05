import AssessmentReport from "../models/AssessmentReport.js";
import {
  storeAssessmentHash,
  verifyAssessmentHash,
} from "../blockchain/services/blockChainService.js";
import crpto from "node:crypto";

export const recordAssessmentReport = async (req, res) => {
  try {
    const { assessmentCode } = req.body;
    if (!assessmentCode) {
      return res.status(400).json({ message: "Assessment code is required" });
    }
    const assessment = await AssessmentReport.findOne({
      assessmentCode,
    }).lean();
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const { _id, __v, ...cleanAssessment } = assessment;
    const dataToHash = JSON.stringify(cleanAssessment);

    const hash = crpto.createHash("sha256").update(dataToHash).digest("hex");

    const txHash = await storeAssessmentHash(hash, assessmentCode);

    res.status(200).json({
      message: "Assessment Hash Recorded on Blockchain",
      txHash,
      hash,
    });
  } catch (error) {
    console.error("Error at uploading the assessment to blockchain");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const validateAssessmentReport = async (req, res) => {
  try {
    const { assessmentCode } = req.body;
    if (!assessmentCode) {
      return res.status(400).json({ message: "Assessment code is required" });
    }
    const assessment = await AssessmentReport.findOne({
      assessmentCode,
    }).lean();
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const { _id, __v, ...cleanAssessment } = assessment;
    const dataToHash = JSON.stringify(cleanAssessment);

    const hash = crpto.createHash("sha256").update(dataToHash).digest("hex");

    const result = await verifyAssessmentHash(hash, assessmentCode);
    if (result) {
      return res
        .status(200)
        .json({ message: "Assessment Verified Succuessully", isValid: result });
    }
    res.status(400).json("Assessment is not recorded to blockchain");
  } catch (error) {
    console.error("Error while velidating assessment report", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
