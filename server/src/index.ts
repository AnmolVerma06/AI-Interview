import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/auth";
import interviewRoutes from "./routes/interviews";
import feedbackRoutes from "./routes/feedback";
import aiRoutes from "./routes/ai";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Hardcoded MongoDB URI (change if needed)
const MONGODB_URI = "mongodb+srv://Anmol66:Anmol%40123@cluster0.hqxp2dn.mongodb.net/?retryWrites=true&w=majority&appName=AI-Interview";


const PORT = process.env.PORT || 4000;

// Routes
app.use("/auth", authRoutes);
app.use("/interviews", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/ai", aiRoutes);
app.use("/gemini", aiRoutes); // Add gemini route for direct feedback generation

app.get("/health", (_req, res) => res.json({ ok: true }));

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`API ready on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
