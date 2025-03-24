import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import JobApplication from "../models/JobApplication.js";
dotenv.configDotenv();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateAssessmentCode = async () => {
  let code;
  let exists;
  do {
    code = Math.random().toString(36).substr(2, 8).toUpperCase();
    exists = await JobApplication.findOne({ assessmentCode: code });
  } while (exists);
  return code;
};

export const sendAssessmentEmail = async (
  to,
  emailSubject,
  generatedAssessmentCode,
  assessmentDateTime,
  assessmentLink
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: emailSubject,
      html: `
            <div style="background-color: #f9f9f9; padding: 20px; font-family: Arial, sans-serif;">
              <table style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <tr>
                  <td style="background: #5E17EB; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">Assessment Invitation</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; color: #333;">
                    <p>Hello,</p>
                    <p>You have been invited to take an assessment. Please find the details below:</p>
                    <p><strong>Assessment Code:</strong> ${generatedAssessmentCode}</p>
                    <p><strong>Date & Time:</strong> ${assessmentDateTime}</p>
                    <p>Click the button below to start your assessment:</p>
                    <div style="text-align: center; margin: 20px 0;">
                     <a href="${assessmentLink}" 
                      style="background: #5E17EB; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;"
                      oncontextmenu="return false" 
                      oncopy="return false" 
                      oncut="return false" 
                      ondragstart="return false">
                      Start Assessment
                    </a>
                    </div>
                    <p>If you have any questions, feel free to contact us.</p>
                    <p>Best Regards,<br>HireSwift Team</p>
                  </td>
                </tr>
                <tr>
                  <td style="background: #000; padding: 10px; text-align: center; color: #ffffff; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} HireSwift. All Rights Reserved.
                  </td>
                </tr>
              </table>
            </div>
          `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};
