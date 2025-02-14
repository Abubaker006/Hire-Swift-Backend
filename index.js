import express from "express";
import { configDotenv } from "dotenv";
import connectDb from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

configDotenv(); //configure dotenv
connectDb(); //connect to database

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//routes
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
