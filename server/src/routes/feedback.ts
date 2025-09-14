import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import Feedback from "../models/Feedback";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

const router = Router();

// Gemini API key (hardcoded as requested)
const GEMINI_API_KEY = "AIzaSyA5Vgn1FIj6S9p4x1CWAF2g7-SYTDdgOLg";

// Feedback schema
const feedbackSchema = {
  type: "object",
  properties: {
    totalScore: { type: "number" },
    categoryScores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          score: { type: "number" },
          comment: { type: "string" },
        },
        required: ["name", "score", "comment"],
      },
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    areasForImprovement: {
      type: "array",
      items: { type: "string" },
    },
    finalAssessment: { type: "string" },
  },
  required: [
    "totalScore",
    "categoryScores",
    "strengths",
    "areasForImprovement",
    "finalAssessment",
  ],
};

// ✅ Generate feedback using Gemini
router.post("/generate-feedback", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { interviewId, transcript } = req.body;
    const userId = req.userId || req.body.userId; // make sure userId exists

    if (!interviewId || !userId || !transcript) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 🟢 Try Gemini first
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        apiKey: GEMINI_API_KEY,
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview transcript. 
        Evaluate the candidate in the categories provided.
        
        Transcript:
        ${transcript}
      `,
      system: "You are a professional interviewer generating structured feedback.",
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
      source: "gemini",
    };

    const doc = await Feedback.create(feedback);
    return res.status(201).json({
      success: true,
      id: doc.id, // ✅ always return id
      message: "Feedback generated successfully",
    });
  } catch (error) {
    console.error("❌ Error generating feedback with Gemini:", error);

    // 🟡 Fallback if Gemini fails
    const fallback = {
      interviewId: req.body.interviewId,
      userId: req.userId || req.body.userId,
      totalScore: 40,
      categoryScores: [
        { name: "Communication Skills", score: 40, comment: "Needs clarity." },
        { name: "Technical Knowledge", score: 40, comment: "Basic knowledge." },
        { name: "Problem-Solving", score: 40, comment: "Limited reasoning." },
        { name: "Cultural & Role Fit", score: 40, comment: "Average fit." },
        { name: "Confidence & Clarity", score: 40, comment: "Low confidence." },
      ],
      strengths: ["Showed effort"],
      areasForImprovement: ["Clarity", "Confidence", "Technical depth"],
      finalAssessment: "Fallback feedback due to system error.",
      createdAt: new Date().toISOString(),
      source: "fallback",
    };

    try {
      const doc = await Feedback.create(fallback);
      console.log("⚠️ Saved fallback feedback with ID:", doc.id);
      return res.status(201).json({
        success: true,
        id: doc.id, // ✅ still return id
        message: "Feedback generated with fallback (Gemini failed)",
      });
    } catch (dbError) {
      console.error("❌ Failed to save fallback feedback:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to save feedback, even fallback failed",
      });
    }
  }
});

// ✅ Legacy endpoint (unchanged)
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { interviewId, totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = req.body as any;
  if (!interviewId) return res.status(400).json({ success: false, message: "Missing interviewId" });
  const doc = await Feedback.create({
    interviewId,
    userId: req.userId!,
    totalScore,
    categoryScores,
    strengths,
    areasForImprovement,
    finalAssessment,
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ success: true, id: doc.id });
});

// ✅ Get feedback by interview
router.get("/by-interview/:id", requireAuth, async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const item = await Feedback.findOne({ interviewId: id, userId: req.userId! });
  if (!item) return res.status(404).json(null);
  return res.json({ success: true, id: item.id, ...item.toObject() });
});

export default router;
