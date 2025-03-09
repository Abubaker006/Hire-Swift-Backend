import express from "express";
import { configDotenv } from "dotenv";
import connectDb from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/JobRoutes.js";
import JobRouteCandidate from "./routes/JobRouteCandidate.js";

configDotenv(); //configure dotenv
connectDb(); //connect to database

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//routes
app.use("/api/auth", authRoutes); //authentication routes
app.use("/api/v1/recruiter/job-postings", jobRoutes); // job posting routes

app.use("/api/v1/candidate/job-postings", JobRouteCandidate); //candidate job postings route

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
