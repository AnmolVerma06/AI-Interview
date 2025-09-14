import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";

const router = Router();

// Gemini API key (hardcoded as requested)
const GEMINI_API_KEY = "AIzaSyA5Vgn1FIj6S9p4x1CWAF2g7-SYTDdgOLg";

// Set the API key as environment variable for @ai-sdk/google
process.env.GOOGLE_GENERATIVE_AI_API_KEY = GEMINI_API_KEY;
console.log("Set GOOGLE_GENERATIVE_AI_API_KEY environment variable:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// Vapi config (hardcoded as requested)
const VAPI_CONFIG = {
  id: "b1674cf2-f6cc-44eb-9c73-ed77934f0b26",
  orgId: "54bc56f8-4f26-492b-a8b1-8a493e1f2b32",
  name: "Morgan",
  voice: {
    voiceId: "Rohan",
    provider: "vapi"
  },
  model: {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an AI Excel Interviewer. \nYour role is to conduct a professional mock interview that tests a candidate's proficiency in Microsoft Excel.\n\nYour behavior and responsibilities:\n- Begin with a polite introduction and explain the interview format.  \n- Ask a structured series of Excel-related questions, starting simple and getting progressively harder (covering formulas, functions, pivot tables, data cleaning, automation, and performance optimization).  \n- Evaluate each answer critically but constructively.  \n- Keep the conversation clear, structured, and encouraging—like a real interviewer.  \n- At the end, summarize performance, highlighting:\n  • Strengths  \n  • Weaknesses  \n  • Practical recommendations for improvement  \n\nConstraints:\n- Remain professional and concise.  \n- Do not give away full answers during the interview—focus on assessment.  \n- Provide the final summary only after completing all interview questions.  \n"
      }
    ],
    provider: "openai"
  },
  firstMessage: "Hello! I'm your AI Excel Interviewer.   This will be a short mock interview to assess your Excel skills.   I'll ask you a few questions, you'll answer them, and at the end I'll give you feedback on your performance.    Shall we get started?  ",
  voicemailMessage: "Hello, this is Morgan from GrowthPartners. I'm calling to discuss how our solutions might help your business operations. I'll try reaching you again, or feel free to call us back at your convenience.",
  endCallMessage: "Thank you for taking the time to discuss your needs with me today. Our team will be in touch with more information soon. Have a great day!",
  transcriber: {
    model: "nova-2",
    language: "en",
    numerals: true,
    provider: "deepgram"
  },
  analysisPlan: {
    minMessagesThreshold: 2
  },
  backgroundDenoisingEnabled: true,
  isServerUrlSecretSet: false
};

// Vapi web token (hardcoded as requested)
const VAPI_WEB_TOKEN = "4f341290-2aa5-48d5-8ae5-1cc768973c04";

// Generate interview questions using Gemini
router.post("/generate-questions", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { role, level, techstack, type, amount } = req.body;
    
    if (!role || !level || !techstack || !type || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3`;

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        apiKey: GEMINI_API_KEY,
        structuredOutputs: false,
      }),
      schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["questions"]
      },
      prompt,
    });

    return res.json({ questions: object.questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ message: "Failed to generate questions" });
  }
});

// Get Vapi config
router.get("/vapi-config", requireAuth, async (req: AuthedRequest, res) => {
  return res.json(VAPI_CONFIG);
});

// Get Vapi web token
router.get("/vapi-token", requireAuth, async (req: AuthedRequest, res) => {
  return res.json({ token: VAPI_WEB_TOKEN });
});

// Test endpoint without auth
router.post("/test", async (req, res) => {
  console.log("=== TEST ENDPOINT HIT ===");
  console.log("Request body:", req.body);
  return res.json({ success: true, message: "Test endpoint working" });
});

// Test Gemini API endpoint
router.post("/test-gemini", async (req, res) => {
  try {
    console.log("=== GEMINI TEST ENDPOINT HIT ===");
    console.log("Gemini API key present:", !!GEMINI_API_KEY);
    
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: "Say hello in one word",
    });
    
    console.log("Gemini test response:", text);
    return res.json({ success: true, response: text });
  } catch (error) {
    console.error("Gemini test error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test Gemini generateObject endpoint
router.post("/test-generate-object", async (req, res) => {
  try {
    console.log("=== GEMINI GENERATE OBJECT TEST ENDPOINT HIT ===");
    
    const result = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: {
        type: "object",
        properties: {
          totalScore: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          finalAssessment: { type: "string" }
        },
        required: ["totalScore", "strengths", "finalAssessment"]
      },
      prompt: "Analyze this interview: 'Hello, how are you?' 'I am good, thank you.' Provide a score from 0-100, list 2 strengths, and give a final assessment.",
    });
    
    console.log("Generate object test response:", result.object);
    return res.json({ success: true, response: result.object });
  } catch (error) {
    console.error("Generate object test error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test MongoDB connection endpoint
router.post("/test-mongodb", async (req, res) => {
  try {
    console.log("=== MONGODB TEST ENDPOINT HIT ===");
    
    // Import Feedback model
    const Feedback = (await import("../models/Feedback")).default;
    console.log("Feedback model imported:", !!Feedback);
    
    // Try to create a simple test document
    const testFeedback = {
      interviewId: "test-interview-id",
      userId: "test-user-id",
      totalScore: 85,
      categoryScores: [{ name: "Test", score: 85, comment: "Test comment" }],
      strengths: ["Test strength"],
      areasForImprovement: ["Test improvement"],
      finalAssessment: "Test assessment",
      createdAt: new Date().toISOString(),
    };
    
    console.log("Creating test feedback document...");
    const doc = await Feedback.create(testFeedback);
    console.log("Test feedback created with ID:", doc.id);
    
    // Clean up - delete the test document
    await Feedback.findByIdAndDelete(doc.id);
    console.log("Test feedback deleted");
    
    return res.json({ success: true, message: "MongoDB test successful", testId: doc.id });
  } catch (error) {
    console.error("MongoDB test error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate feedback using Gemini (direct endpoint) - temporarily without auth for testing
router.post("/feedback", async (req, res) => {
  try {
    console.log("=== GEMINI FEEDBACK ENDPOINT HIT ===");
    console.log("Request body:", req.body);
    console.log("User ID from auth:", req.userId);
    
    const { interviewId, userId, transcript, feedbackId } = req.body;
    
    // For testing, use a default userId if not provided
    const finalUserId = userId || "test-user-id";
    
    if (!interviewId || !transcript) {
      console.log("Missing required fields:", { interviewId: !!interviewId, userId: !!userId, transcript: !!transcript });
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: interviewId, transcript" 
      });
    }

    console.log("Gemini feedback generation for interview:", interviewId);
    console.log("Transcript received:", transcript);
    console.log("Transcript type:", typeof transcript);
    console.log("Transcript length:", transcript.length);

    console.log("Calling Gemini API with key:", GEMINI_API_KEY ? "Present" : "Missing");
    
    let object;
    try {
      const result = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: {
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
                comment: { type: "string" }
              }
            }
          },
          strengths: {
            type: "array",
            items: { type: "string" }
          },
          areasForImprovement: {
            type: "array",
            items: { type: "string" }
          },
          finalAssessment: { type: "string" }
        },
        required: ["totalScore", "categoryScores", "strengths", "areasForImprovement", "finalAssessment"]
      },
      prompt: `
        You are an AI interviewer analyzing a mock interview transcript. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Interview Transcript:
        ${transcript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.

        Provide a comprehensive analysis with specific examples from the transcript. Be constructive but honest in your assessment.
        `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories and provide detailed feedback.",
      });
      
      object = result.object;
      console.log("Generated feedback object:", object);
      console.log("Generated feedback object type:", typeof object);
      console.log("Generated feedback object keys:", Object.keys(object || {}));
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      console.error("Gemini API error details:", {
        message: geminiError.message,
        stack: geminiError.stack,
        name: geminiError.name
      });
      throw new Error(`Gemini API failed: ${geminiError.message}`);
    }

    // Import Feedback model
    console.log("Importing Feedback model...");
    const Feedback = (await import("../models/Feedback")).default;
    console.log("Feedback model imported successfully:", !!Feedback);

    const feedback = {
      interviewId,
      userId: finalUserId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Feedback object to save:", feedback);

    let doc;
    try {
      doc = await Feedback.create(feedback);
      console.log("Feedback saved with ID:", doc.id);
    } catch (dbError) {
      console.error("Database save error:", dbError);
      throw new Error(`Database save failed: ${dbError.message}`);
    }
    
    return res.status(201).json({ 
      success: true, 
      feedbackId: doc.id,
      message: "Feedback generated successfully" 
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return res.status(500).json({ 
      success: false,
      message: "Failed to generate feedback",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
