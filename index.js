import express from "express";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
