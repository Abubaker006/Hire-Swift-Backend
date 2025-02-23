//recruiter specific operation.
import JobPosting from "../models/JobPosting.js";
import User from "../models/User.js";

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

  if (status) query.status = status;

  try {
    const postings = await JobPosting.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("title jobType status createdAt");

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
