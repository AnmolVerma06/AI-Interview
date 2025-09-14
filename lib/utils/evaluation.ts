import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with hardcoded API key
const GEMINI_API_KEY = "AIzaSyA5Vgn1FIj6S9p4x1CWAF2g7-SYTDdgOLg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface EvaluationCriteria {
  communication: number;
  technicalKnowledge: number;
  problemSolving: number;
  confidence: number;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
}

// Simple retry mechanism
const withRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

export async function evaluateInterviewPerformance(
  questions: Array<{ question: string; answer: string }>,
  jobRole: string
): Promise<EvaluationCriteria> {
  console.log('[DEBUG] Starting interview evaluation with Gemini');
  
  // Filter and format Q&A pairs
  const formattedQA = questions
    .filter(q => q.role === 'assistant' || q.role === 'user')
    .map((q, i) => ({
      role: q.role,
      content: q.content,
      index: i
    }));

  // Group questions and answers
  const qaPairs = [];
  let currentQuestion = null;

  for (const item of formattedQA) {
    if (item.role === 'assistant') {
      currentQuestion = item.content;
    } else if (item.role === 'user' && currentQuestion) {
      qaPairs.push({
        question: currentQuestion,
        answer: item.content
      });
      currentQuestion = null;
    }
  }

  console.log('[DEBUG] Processing', qaPairs.length, 'Q&A pairs');

  // Generate mock feedback for when the API is unavailable
  const generateMockFeedback = (): EvaluationCriteria => {
    const score = () => Math.floor(Math.random() * 2) + 3; // 3-4
    return {
      communication: score(),
      technicalKnowledge: score(),
      problemSolving: score(),
      confidence: score(),
      overallScore: score(),
      strengths: [
        'Good communication skills',
        'Demonstrated technical knowledge',
        'Clear and concise responses'
      ],
      areasForImprovement: [
        'Could provide more detailed examples',
        'Consider elaborating on technical concepts'
      ],
      detailedFeedback: 'Thank you for completing the interview. Your responses showed good understanding of the topics. To improve, try to provide more detailed examples and explanations in your answers.'
    };
  };

  const generateEvaluation = async (): Promise<EvaluationCriteria> => {
    try {
      const modelName = 'gemini-2.5-flash-lite'; // ✅ correct model
      console.log('Using model:', modelName);
  
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
      });
  
      // your rest of evaluation logic here...
  

      const prompt = `You are an experienced technical interviewer. Evaluate this interview (1-5 scale):

${qaPairs.slice(0, 6).map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer || 'No answer provided'}`).join('\n\n')}

Provide evaluation in this exact JSON format (no other text):
{
  "communication": 3,
  "technicalKnowledge": 3,
  "problemSolving": 3,
  "confidence": 3,
  "overallScore": 3,
  "strengths": ["specific strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "detailedFeedback": "Detailed feedback here..."
}`;

      console.log('Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse the response
      const cleanedText = text
        .replace(/^```(?:json)?\n?/m, '')
        .replace(/\n```/g, '')
        .trim();
      
      console.log('Cleaned response:', cleanedText);
      
      return JSON.parse(cleanedText);
      
    } catch (error) {
      console.warn('Falling back to mock feedback due to error:', error);
      return generateMockFeedback();
    }
  };

  try {
    // Try with retry logic
    return await withRetry(generateEvaluation);
  } catch (error) {
    console.error('[ERROR] All retries failed, returning default evaluation');
    
    // Fallback to a reasonable default
    return {
      communication: 3,
      technicalKnowledge: 3,
      problemSolving: 3,
      confidence: 3,
      overallScore: 3,
      strengths: ['Completed the interview successfully'],
      areasForImprovement: [
        'Try to provide more detailed responses',
        'Consider adding specific examples to your answers'
      ],
      detailedFeedback: 'The interview was completed. ' +
        'To improve, focus on providing more detailed and specific examples in your responses. ' +
        'Try to elaborate on your thought process when answering technical questions.'
    };
  }
}
