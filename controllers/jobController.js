import JobPosting from "../models/JobPosting.js";
import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import mongoose from "mongoose";

// @route POST /api/v1/recruiter/job-postings
export const createJobPosting = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    console.log("User Id", recruiterId);
    const recruiter = await User.findById(recruiterId);

    console.log("User", recruiter);
    console.log("REQUEST BODY", req.body);

    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        message: "Only recruiters can post job, unauthorized access.",
      });
    }

    if (!req.body) {
      return res.status(400).json({ message: "Not a valid job post." });
    }

    const jobPosting = new JobPosting({ ...req.body, recruiterId });
    await jobPosting.save();

    res.status(201).json({
      id: jobPosting._id,
      status: jobPosting.status,
      createdAt: jobPosting.createdAt,
      message: "Job posting created successfully",
    });
  } catch (error) {
    console.error("Error at creating Job", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @route GET /api/v1/recruiter/job-postings

export const getAllJobPosting = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const recruiterId = req.user?.id;
  const query = { recruiterId };

  if (status) {
    query.status = { $in: status.split(",") };
  }

  try {
    const postings = await JobPosting.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("id title jobType status locationType createdAt updatedAt");
    console.log("Postings", postings);
    const total = await JobPosting.countDocuments(query);
    console.log("total", total);
    res.json({
      data: postings,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route GET /api/v1/recruiter/job-postings/:id

export const getJobPost = async (req, res) => {
  try {
    const posting = await JobPosting.findOne({
      _id: req.params.id,
      recruiterId: req.user?.id,
    });
    if (!posting)
      return res.status(404).json({ error: "Job posting not found" });
    res.json(posting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @route PUT /api/v1/recruiter/job-postings/:id

export const updateJobPosting = async (req, res) => {
  try {
    const posting = await JobPosting.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user?.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!posting)
      return res.status(404).json({ message: "Error, job posting not found." });

    res.json({
      id: posting._id,
      status: posting.status,
      updatedAt: posting.updatedAt,
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//@route DELETE /api/v1/recruiter/job-postings/:id

export const deleteJobPosting = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const { id } = req.params;

    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        message: "Only Recruiters are allowed to delete job posting",
      });
    }

    const posting = await JobPosting.findOneAndDelete({
      _id: req.params.id,
      recruiterId: req.user?.id,
    });

    if (!posting)
      return res.status(404).json({ error: "Job posting not found" });
    res.status(204).json({ message: "Job  Posting deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@route PATCH /api/v1/recruiter/job-postings/:id/status

export const updateJobPostingStatus = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(403).json({
        message: "Only Recruiters are allowed to update job posting status",
      });
    }

    const validStatuses = ["draft", "published", "closed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const posting = await JobPosting.findOneAndUpdate(
      { _id: id, recruiterId },
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!posting) {
      return res.status(404).json({ message: "Job posting not found." });
    }

    const capitalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    res.status(200).json({
      id: posting._id,
      status: capitalizedStatus,
      updatedAt: posting.updatedAt,
      message: "Job posting status updated successfully",
    });
  } catch (error) {
    console.error("Error updating job posting status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @route POST /api/v1/candidate/job-postings/:id/apply
export const applyToJobPosting = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "candidate") {
      return res
        .status(403)
        .json({ message: "Only candidates can apply to jobs" });
    }

    const job = await JobPosting.findById(id);
    if (!job || job.status !== "published") {
      return res
        .status(404)
        .json({ message: "Job posting not found or not available" });
    }

    const existingApplication = await JobApplication.findOne({
      userId,
      jobId: id,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    if (user.tokens < 10) {
      return res.status(403).json({ message: "Insufficient tokens to apply" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      user.tokens -= 10;
      await user.save({ session });

      const SLOT_DURATION = 30 * 60 * 1000;
      const MAX_SLOTS_PER_DAY = 10;
      const START_HOUR = 9;
      const END_HOUR = 14;

      let scheduledDateTime;
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);

      while (!scheduledDateTime) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(START_HOUR, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(END_HOUR, 0, 0, 0);

        const scheduledCount = await JobApplication.countDocuments({
          "assessment.scheduledDateTime": {
            $gte: dayStart,
            $lt: dayEnd,
          },
        }).session(session);

        if (scheduledCount < MAX_SLOTS_PER_DAY) {
          const scheduledTimes = await JobApplication.find({
            "assessment.scheduledDateTime": {
              $gte: dayStart,
              $lt: dayEnd,
            },
          })
            .select("assessment.scheduledDateTime")
            .sort("assessment.scheduledDateTime")
            .session(session);

          let nextSlot = new Date(dayStart);
          const takenSlots = scheduledTimes.map((app) =>
            app.assessment.scheduledDateTime.getTime()
          );

          for (let i = 0; i < MAX_SLOTS_PER_DAY; i++) {
            const slotTime = nextSlot.getTime();
            if (!takenSlots.includes(slotTime)) {
              scheduledDateTime = new Date(slotTime);
              break;
            }
            nextSlot = new Date(slotTime + SLOT_DURATION);
          }
        }

        if (!scheduledDateTime) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const application = new JobApplication({
        userId,
        jobId: id,
        status: "assessment_scheduled",
        assessment: {
          scheduled: true,
          scheduledDateTime,
        },
      });
      await application.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Successfully applied and assessment scheduled",
        tokensRemaining: user.tokens,
        applicationId: application._id,
        assessmentDateTime: application.assessment.scheduledDateTime,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @route GET /api/v1/candidate/job-postings
export const getAllCandidateJobPostings = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const query = { status: "published" };

  try {
    const userApplications = await JobApplication.find({ userId }).select(
      "jobId"
    );

    const appliedJobIds = userApplications.map((app) => app.jobId);

    const postings = await JobPosting.find({
      ...query,
      _id: { $nin: appliedJobIds },
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select(
        "id title jobType locationType locationDetails description techStack duration team createdAt requiredQualification prefferedQualification compensation applicationDeadLine startDate diversity statement contactEmail"
      );

    const jobIds = postings.map((job) => job._id);
    const applicationsCount = await JobApplication.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: "$jobId",
          numberOfSubmittedApplications: { $sum: 1 },
        },
      },
    ]);

    const postingsWithCounts = postings.map((job) => {
      const count = applicationsCount.find((c) => c._id.equals(job._id)) || {
        numberOfSubmittedApplications: 0,
      };
      return {
        ...job.toObject(),
        numberOfSubmittedApplications: count.numberOfSubmittedApplications,
      };
    });

    const total = await JobPosting.countDocuments({
      ...query,
      _id: { $nin: appliedJobIds },
    });

    res.status(200).json({
      data: postingsWithCounts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    res.status(500).json({ error: error.message });
  }
};
