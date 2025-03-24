import JobApplication from "../models/JobApplication.js";
import JobPosting from "../models/JobPosting.js";
import { generateAssessmentToken } from "../utils/jwt.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scoreQuestion } from "../utils/questionScoring.js";
import { geminiEvaluation } from "../AI-Models/aiModels.js";
import { getGemniPrompt } from "../utils/prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/1000_Questions_dataset.json"),
    "utf-8"
  )
);
const allQuestions = questionsData.questions;

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
    const totalTimeMinutes = 40;
    const totalTimeSeconds = totalTimeMinutes * 60;
    const assessmentEndTime = new Date(
      scheduledDateTime.getTime() + totalTimeSeconds * 1000
    );
    const GRACE_PERIOD_MINUTES = 5; //means we give user margin to be late for 5 mins
    const gracePeriodEndTime = new Date(
      scheduledDateTime.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000
    );

    let response;
    if (now < scheduledDateTime) {
      //case-1 if assessment hasnt started yet.
      console.log("Case-1");
      response = {
        message: "Assessment not available right now",
        canStart: false,
        questions: null,
        scheduledDateTime: application.assessment.scheduledDateTime,
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      };
    } else if (
      now >= scheduledDateTime &&
      now <= gracePeriodEndTime &&
      !application.assessment.taken &&
      !application.assessment.isStarted
    ) {
      // case-2 assessment is ready to start or in progress, and not yet taken we start it immediately
      console.log("Case-2");
      response = {
        message: "Assessment ready to start",
        canStart: true,
        questions: null,
        scheduledDateTime: application.assessment.scheduledDateTime,
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      };
    } else if (
      now > gracePeriodEndTime &&
      now <= assessmentEndTime &&
      !application.assessment.taken &&
      !application.assessment.isStarted
    ) {
      // case 3: after the grace time but within total time, marked missed.
      console.log("Case-3");
      application.status = "assessment_missed";
      application.assessment.taken = true;
      application.assessment.completedDate = new Date();

      await application.save();
      response = {
        message: "Assessment missed due to late arrival",
        canStart: false,
        questions: null,
        scheduledDateTime: application.assessment.scheduledDateTime,
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      };
    } else if (application.assessment.taken) {
      //case-4 Assessment has already been taken
      console.log("Case-4");
      response = {
        message: "Assessment already taken",
        canStart: false,
        questions: null,
        scheduledDateTime: application.assessment.scheduledDateTime,
        status: application.status,
        canStart: false,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      };
    } else if (
      !application.assessment.taken &&
      now <= assessmentEndTime &&
      application.assessment.isStarted
    ) {
      //case 6 when assessment is in progress.
      console.log("Case-6");
      const remainingQuestions = application.assessment.questions.filter(
        (q) => !q.isSubmitted
      );

      const now = Date.now();
      const startTime = new Date(application.assessment.startTime).getTime();

      const elapsedTime = Math.floor((now - startTime) / 1000);

      const filteredQuestionsResponse = remainingQuestions.map((q, index) => {
        if (index === 0) {
          const adjustedTimeLimit = Math.max(0, q.timeLimit - elapsedTime);
          return {
            id: q.id.toString(),
            question: q.question,
            type: q.type,
            difficulty: q.difficulty,
            classification: q.classification,
            timeLimit: adjustedTimeLimit,
            index: q.index,
          };
        }
        return {
          id: q.id.toString(),
          question: q.question,
          type: q.type,
          difficulty: q.difficulty,
          classification: q.classification,
          timeLimit: q.timeLimit,
          index: q.index,
        };
      });

      return res.status(200).json({
        message: "Assessment Resumed",
        canStart: true,
        questions: filteredQuestionsResponse,
        totalTime: Math.max(0, Math.floor((assessmentEndTime - now) / 1000)),
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      });
    } else {
      // case 7 : Assessment window has expired.
      console.log("Case-7");
      response = {
        message: "Assessment window expired",
        scheduledDateTime: application.assessment.scheduledDateTime,
        status: application.status,
        canStart: false,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occured while validating the assessment.", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//@route POST /api/v1/assessment/start-assessment
export const startAssessment = async (req, res) => {
  try {
    const { userId, jobId, assessmentCode } = req.user;
    if (!userId || !jobId || !assessmentCode)
      return res.status(401).json({ message: "No token provided" });

    const application = await JobApplication.findOne({
      userId,
      jobId,
      "assessment.assessmentCode": assessmentCode,
    });

    if (!application || !application.assessment.scheduled) {
      return res
        .status(404)
        .json({ message: "Assessment not found or not scheduled" });
    }

    if (application.assessment.taken) {
      return res.status(403).json({ message: "Assessment already taken" });
    }

    const jobPosting = await JobPosting.findById(jobId);
    if (!jobPosting) {
      return res.status(404).json({ message: "Job Posting has been deleted" });
    }

    const techStack = jobPosting.techStack.map((t) => t.toLowerCase());
    const numberOfQuestions = 10;
    const targetDifficulty = { Easy: 0.3, Medium: 0.5, Hard: 0.2 };
    let filteredQuestions = allQuestions.map((q) => ({
      ...q,
      score: scoreQuestion(q, techStack),
    }));

    filteredQuestions.sort((a, b) => b.score - a.score);

    let codingQuestions = filteredQuestions.filter((q) => q.type === "coding");
    let theoryQuestions = filteredQuestions.filter((q) => q.type === "theory");

    const selectQuestions = (questions, difficulty, count) => {
      return questions
        .filter((q) => q.difficulty === difficulty)
        .slice(0, count);
    };

    let selectedQuestions = [
      ...selectQuestions(
        codingQuestions,
        "Easy",
        Math.ceil(targetDifficulty.Easy / 2)
      ),
      ...selectQuestions(
        theoryQuestions,
        "Easy",
        Math.floor(targetDifficulty.Easy / 2)
      ),
      ...selectQuestions(
        codingQuestions,
        "Hard",
        Math.ceil(targetDifficulty.Hard / 2)
      ),
      ...selectQuestions(
        theoryQuestions,
        "Hard",
        Math.floor(targetDifficulty.Hard / 2)
      ),
      ...selectQuestions(
        codingQuestions,
        "Medium",
        Math.ceil(targetDifficulty.Medium / 2)
      ),
      ...selectQuestions(
        theoryQuestions,
        "Medium",
        Math.floor(targetDifficulty.Medium / 2)
      ),
    ];
    while (selectedQuestions.length < numberOfQuestions) {
      let remainingQuestion = filteredQuestions.find(
        (q) => !selectedQuestions.some((sq) => sq.id === q.id)
      );
      if (!remainingQuestion) break;
      selectedQuestions.push(remainingQuestion);
    }

    if (selectedQuestions.length < numberOfQuestions) {
      return res.status(400).json({
        message: "Not Enough Questions",
        canStart: false,
        scheduledDateTime: application.assessment.scheduledDateTime,
        questions: null,
        totalTime: null,
        token: null,
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      });
    }

    if (selectedQuestions.length < numberOfQuestions) {
      return res.status(400).json({
        message: "Not Enought Questions",
        canStart: false,
        scheduledDateTime: application.assessment.scheduledDateTime,
        questions: null,
        totalTime: null,
        token: null,
        status: application.status,
        assessment: {
          scheduled: application.assessment.scheduled,
          taken: application.assessment.taken,
          passed: application.assessment.passed,
          overallScore: application.assessment.overallScore || null,
        },
      });
    }

    const totalTimeSeconds = 40 * 60;
    const timePerQuestion = Math.floor(totalTimeSeconds / numberOfQuestions);
    var index = 0;
    const questionsWithTime = selectedQuestions.map((q) => ({
      id: q.id.toString(),
      question: q.question,
      type: q.type,
      difficulty: q.difficulty,
      classification: q.classification,
      timeLimit: timePerQuestion,
      index: index++,
    }));
    console.log("Quesitons with time", questionsWithTime);

    application.assessment.questions = questionsWithTime;
    application.status = "assessment_started";
    application.assessment.isStarted = true;
    application.assessment.startTime = new Date();

    await application.save();

    const expiry = Math.floor(Date.now() / 1000) + 45 * 60;
    const assessmentToken = generateAssessmentToken(
      userId,
      jobId,
      assessmentCode,
      expiry
    );

    return res.status(200).json({
      message: "Assessment started",
      canStart: false,
      scheduledDateTime: application.assessment.scheduledDateTime,
      questions: questionsWithTime,
      totalTime: totalTimeSeconds,
      token: assessmentToken,
      status: application.status,
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//@route POST /api/v1/assessment/submit-answer
export const submitAssessmentAnswer = async (req, res) => {
  try {
    const { questionId, answer, language } = req.body;
    const { userId, jobId, assessmentCode } = req.user;
    console.log("Decoded Token (req.user):", req.user);
    console.log("Request Body:", req.body);

    if (!userId || !jobId || !assessmentCode || !questionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const application = await JobApplication.findOne({
      userId,
      jobId,
      "assessment.assessmentCode": assessmentCode,
    });

    if (
      !application ||
      !application.assessment.isStarted ||
      application.assessment.taken
    ) {
      return res.status(403).json({ message: "Assessment not in progress" });
    }

    const now = new Date();
    const assessmentEndTime = new Date(
      application.assessment.scheduledDateTime.getTime() + 40 * 60 * 1000 // 40 minutes
    );

    if (now > assessmentEndTime) {
      application.assessment.taken = true;
      application.status = "assessment_taken";
      await application.save();
      return res.status(403).json({ message: "Assessment time expired" });
    }

    const questionIdNum = Number(questionId);

    const questionIndex = application.assessment.questions.findIndex(
      (q) => q.id === questionIdNum
    );
    console.log(questionIndex);
    if (questionIndex === -1) {
      return res.status(400).json({ message: "Questions already submitted." });
    }

    const question = application.assessment.questions[questionIndex];

    if (question.isSubmitted) {
      return res.status(400).json({ message: "Question already submitted" });
    }

    question.submittedAnswer.push({ answer, language });
    question.isSubmitted = true;

    const allQuestionsSubmitted = application.assessment.questions.every(
      (q) => q.isSubmitted
    );

    if (allQuestionsSubmitted) {
      application.assessment.taken = true;
      application.status = "assessment_taken";
    }

    application.assessment.lastActivity = now;

    await application.save();

    return res.status(200).json({ message: "Answer Submitted Successfully." });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//@route POST /api/v1/assessment/start-evaluation
export const startAssessmentEvaluation = async (req, res) => {
  try {
    const { answers } = req.body;
    console.log("Answers", answers);
    const { userId, jobId, assessmentCode } = req.user;
    console.log("Job Application Id", req.user);

    if (!userId || !jobId || !assessmentCode || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Job Application id or answers array is required.",
      });
    }

    const jobApplication = await JobApplication.findOne({
      userId,
      jobId,
      "assessment.assessmentCode": assessmentCode,
    });
    console.log("Job Application was this", jobApplication);
    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: "Job Applicaiton not found.",
      });
    }
    // if (!jobApplication.assessment || jobApplication.assessment.completedDate) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Assessment not available or already completed",
    //   });
    // }
    const evaluation = [];
    let totalScore = 0;

    console.log("Entering loop to process answers...");
    const prompt = getGemniPrompt(jobApplication.assessment.questions, answers);

    console.log("Entering loop to process answers...");
    const response = await geminiEvaluation(prompt);
    console.log("response from gemini", response);
    res
      .status(200)
      .json({ response: response, message: "Evaluation Successful." });
  } catch (error) {
    console.error("Error occured while starting evaluation.", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
