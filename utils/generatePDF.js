import PDFDocument from "pdfkit";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { generateChart } from "./generateChart.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportsDir = path.join(__dirname, "../reports");

const theme = {
  primaryColor: "#5E17EB",
  secondaryColor: "#5E17EB",
  accentColor: "#00000",
  textColor: "#333333",
  fontRegular: "Helvetica",
  fontBold: "Helvetica-Bold",
  margin: 50,
};

export const generatePDF = async (evaluationData, res) => {
  try {
    const userId = `${
      evaluationData.candidateName
    }-${evaluationData.userId.toString()}`;
    if (!fs.existsSync(reportsDir))
      fs.mkdirSync(reportsDir, { recursive: true });
    const userFolder = path.join(reportsDir, userId);
    if (!fs.existsSync(userFolder))
      fs.mkdirSync(userFolder, { recursive: true });

    const pdfPath = path.join(userFolder, "assessment_report.pdf");
    const doc = new PDFDocument({ margin: theme.margin });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const addHeader = () => {
      doc.fillColor(theme.primaryColor).rect(0, 0, doc.page.width, 60).fill();
      doc
        .font(theme.fontBold)
        .fontSize(20)
        .fillColor("#FFFFFF")
        .text(
          `HireSwift Assessment #${evaluationData.assessmentCode} Report`,
          theme.margin,
          20,
          { align: "center" }
        );
      doc.moveDown(2);
    };

    addHeader();
    doc.moveDown(1);

    doc
      .font(theme.fontBold)
      .fontSize(12)
      .fillColor(theme.textColor)
      .text(`Candidate: ${evaluationData.candidateName}`)
      .moveDown(0.3);
    doc
      .font(theme.fontBold)
      .fontSize(12)
      .fillColor(theme.textColor)
      .text(`Job Title: ${evaluationData.jobTitle}`)
      .moveDown(0.3);
    doc
      .font(theme.fontBold)
      .fontSize(12)
      .fillColor(theme.textColor)
      .text(`Assessment: ${evaluationData.assessmentName}`)
      .moveDown(0.3);
    doc
      .font(theme.fontBold)
      .fontSize(12)
      .fillColor(theme.textColor)
      .text(`Assessment Code: ${evaluationData.assessmentCode}`)
      .moveDown(0.3);

    const totalScore = evaluationData.stats.right * 10;
    doc
      .font(theme.fontBold)
      .fontSize(18)
      .fillColor("#000000")
      .text(`Total Score`);
    doc.circle(doc.page.width / 2.1, doc.y + 40, 40).fill(theme.secondaryColor);
    doc
      .font(theme.fontBold)
      .fontSize(18)
      .fillColor("#ffffff")
      .text(`${totalScore}/100`, doc.page.width / 2 - 40, doc.y - -30);
    doc.moveDown(1);

    doc
      .font(theme.fontBold)
      .fontSize(16)
      .fillColor(theme.primaryColor)
      .text("Performance Summary", theme.margin, doc.y, { underline: true });
    const { right, wrong, average } = evaluationData.stats;
    doc.moveDown(1);
    [
      { label: "Right", value: right, color: "green" },
      { label: "Wrong", value: wrong, color: theme.accentColor },
      { label: "Average", value: average, color: "orange" },
    ].forEach(({ label, value, color }) => {
      doc
        .fillColor(color)
        .fontSize(12)
        .text(`${label}: ${value}`, { indent: 20 })
        .moveDown(0.5);
    });

    doc
      .moveDown(1)
      .font(theme.fontBold)
      .fontSize(16)
      .fillColor(theme.primaryColor)
      .text("Strengths & Weaknesses", { underline: true })
      .moveDown(0.5)
      .font(theme.fontRegular)
      .fontSize(12)
      .fillColor(theme.textColor)
      .text(
        `Strong Topics: ${evaluationData.observation.keyStrengths.join(", ")}`,
        { indent: 20 }
      )
      .moveDown(0.5)
      .text(
        `Topics to Improve: ${evaluationData.observation.keyWeaknesses.join(
          ", "
        )}`,
        { indent: 20 }
      );

    doc.moveDown(2);
    const chartImage = await generateChart(right, wrong, average);
    if (fs.existsSync(chartImage)) {
      const imageWidth = 250;
      const centerX = (doc.page.width - imageWidth) / 2;
      doc.image(chartImage, centerX, doc.y, { width: imageWidth }).moveDown(2);
    }


    doc.addPage();

    doc
      .font(theme.fontBold)
      .fontSize(16)
      .fillColor(theme.primaryColor)
      .text("Questions & Feedback", { underline: true })
      .moveDown(1);
    evaluationData.questions.forEach((q, index) => {
      let startY = doc.y;
      let contentWidth = doc.page.width - theme.margin * 2;

      let questionText = `Q${index + 1}: ${q.question}`;
      let categoryText = `Category: ${q.category || "Unknown"}`;
      let topicText = `Topic: ${
        q.topic && q.topic !== "General" ? q.topic : "Uncategorized"
      }`;
      let feedbackText = `Feedback: ${q.feedback}`;

      let questionHeight = doc.heightOfString(questionText, {
        width: contentWidth,
      });
      let categoryHeight = doc.heightOfString(categoryText, {
        width: contentWidth,
      });
      let topicHeight = doc.heightOfString(topicText, { width: contentWidth });
      let feedbackHeight = doc.heightOfString(feedbackText, {
        width: contentWidth,
      });

      let totalHeight =
        questionHeight + categoryHeight + topicHeight + feedbackHeight + 40; // Add padding

      if (startY + totalHeight > doc.page.height - theme.margin) {
        doc.addPage();
        startY = theme.margin;
      }
      doc
        .roundedRect(theme.margin, startY, contentWidth, totalHeight, 10)
        .stroke(theme.secondaryColor);

      doc
        .font(theme.fontRegular)
        .fontSize(12)
        .fillColor(theme.textColor)
        .text(questionText, theme.margin + 5, startY + 5)
        .moveDown(0.5)
        .fillColor(q.category === "Right" ? "green" : theme.accentColor)
        .text(categoryText, theme.margin + 5)
        .moveDown(0.5)
        .fillColor("blue")
        .text(topicText, theme.margin + 5)
        .moveDown(0.5)
        .fillColor(theme.textColor)
        .text(feedbackText, theme.margin + 5);

      doc.y = startY + totalHeight + 10;
    });

    if (doc.y + 150 > doc.page.height - theme.margin) {
      doc.addPage();
    }

    doc.moveDown(2);

    doc
      .font(theme.fontBold)
      .fontSize(16)
      .fillColor(theme.primaryColor)
      .text("Candidate Observations", theme.margin, doc.y, { underline: true })
      .moveDown(1);

    const observations = [
      {
        title: "Code Quality Feedback",
        text: evaluationData.observation.codeQualityFeedback,
      },
      {
        title: "Problem-Solving Feedback",
        text: evaluationData.observation.problemSolvingFeedback,
      },
      {
        title: "Key Strengths",
        text: evaluationData.observation.keyStrengths.length
          ? evaluationData.observation.keyStrengths.join(", ")
          : "None",
      },
      {
        title: "Key Weaknesses",
        text: evaluationData.observation.keyWeaknesses.length
          ? evaluationData.observation.keyWeaknesses.join(", ")
          : "None",
      },
      { title: "Next Steps", text: evaluationData.observation.nextSteps },
      { title: "Summary", text: evaluationData.observation.summary },
    ];

    observations.forEach(({ title, text }) => {
      let startY = doc.y;
      let contentWidth = doc.page.width - theme.margin * 2;

      let titleHeight = doc.heightOfString(title, { width: contentWidth });
      let textHeight = doc.heightOfString(text, { width: contentWidth });
      let totalHeight = titleHeight + textHeight + 40;

      if (startY + totalHeight > doc.page.height - theme.margin) {
        doc.addPage();
        startY = theme.margin;
      }
      doc.save();
      doc.roundedRect(theme.margin, startY, contentWidth, totalHeight, 10);
      doc.restore();

      doc
        .roundedRect(theme.margin, startY, contentWidth, totalHeight, 10)
        .stroke(theme.secondaryColor);

      doc
        .font(theme.fontBold)
        .fontSize(14)
        .fillColor(theme.primaryColor)
        .text(title, theme.margin + 10, startY + 10);

      doc
        .font(theme.fontRegular)
        .fontSize(12)
        .fillColor(theme.textColor)
        .text(text, theme.margin + 10, doc.y + 5, { width: contentWidth - 20 });

      doc.y = startY + totalHeight + 10;
    });

    doc.end();

    stream.on("finish", () => {
      res.download(pdfPath, "assessment_report.pdf", (err) => {
        if (err) console.error("Error sending PDF:", err);
      });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent)
      res.status(500).json({ message: "Error generating PDF" });
  }
};
