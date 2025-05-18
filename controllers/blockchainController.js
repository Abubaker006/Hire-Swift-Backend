import AssessmentReport from "../models/AssessmentReport.js";
import {
  storeAssessmentHash,
  verifyAssessmentHash,
} from "../blockchain/services/blockChainService.js";
import crpto from "node:crypto";

export const recordAssessmentReport = async (req, res) => {
  try {
    const { assessmentCode } = req.body;

    const assessment = await AssessmentReport.findOne({
      assessmentCode,
    }).lean();
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const { _id, _v, ...cleanAssessment } = assessment;
    const dataToHash = JSON.stringify(cleanAssessment);

    const hash = crpto.createHash("sha256").update(dataToHash).digest("hex");

    const txHash = await storeAssessmentHash(assessmentCode, hash);

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
    const assessment = await AssessmentReport.findOne({
      assessmentCode,
    }).lean();
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    const { _id, _v, ...cleanAssessment } = assessment;
    const dataToHash = JSON.stringify(cleanAssessment);

    const hash = crpto.createHash("sha256").update(dataToHash).digest("hex");

    const result = await verifyAssessmentHash(assessmentCode, hash);
    res
      .status(200)
      .json({ message: "Assessment Verified Succuessully", isValid: result });
  } catch (error) {
    console.error("Error while velidating assessment report", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
