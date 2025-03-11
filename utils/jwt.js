import jwt from "jsonwebtoken";

//generate JWT TOKEN
export const generateToken = (user, expiryDate) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: expiryDate,
  });
};

export const generateAssessmentToken = (
  userId,
  jobId,
  assessmentCode,
  expiry
) => {
  return jwt.sign(
    { userId, jobId, assessmentCode, exp: Math.floor(expiry / 1000) },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );
};
