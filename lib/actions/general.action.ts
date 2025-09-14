// ... (rest of the code remains the same)

import { collection } from "firebase/firestore";

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  
  try {
    console.log(`[DEBUG] Starting getFeedbackByInterviewId`);
    console.log(`[DEBUG] interviewId: "${interviewId}" (length: ${interviewId.length})`);
    console.log(`[DEBUG] userId: ${userId}`);
    
    const { db, collection, query, where, getDocs, limit, orderBy } = await import("@/lib/firebase");
    console.log('[DEBUG] Firebase imports successful');
    
    // First, try to find by interviewId
    const feedbacksRef = collection(db, "feedbacks");
    console.log('[DEBUG] Created feedbacks reference');
    
    // Try exact match first
    const interviewQuery = query(
      feedbacksRef,
      where("interviewId", "==", interviewId.trim())
    );
    
    console.log('[DEBUG] Executing interviewId query');
    const interviewQuerySnapshot = await getDocs(interviewQuery);
    console.log(`[DEBUG] Found ${interviewQuerySnapshot.size} documents with matching interviewId`);
    
    if (!interviewQuerySnapshot.empty) {
      const doc = interviewQuerySnapshot.docs[0];
      const data = doc.data();
      console.log('[DEBUG] Found matching feedback:', { id: doc.id, data });
      
      return {
        id: doc.id,
        interviewId: data.interviewId,
        userId: data.userId,
        feedback: data.detailedFeedback || data.feedback || "No feedback available.",
        communication: data.communication || 0,
        technicalKnowledge: data.technicalKnowledge || 0,
        problemSolving: data.problemSolving || 0,
        confidence: data.confidence || 0,
        overallScore: data.overallScore || 0,
        strengths: data.strengths || [],
        areasForImprovement: data.areasForImprovement || [],
        status: data.status || "completed",
        transcript: data.transcript || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }
    
    // If not found by interviewId, try to find any feedback for this user
    console.log('[DEBUG] No feedback found by interviewId, trying to find by userId');
    const userQuery = query(
      feedbacksRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    
    console.log('[DEBUG] Executing userId query');
    const userQuerySnapshot = await getDocs(userQuery);
    console.log(`[DEBUG] Found ${userQuerySnapshot.size} feedback entries for user`);
    
    if (!userQuerySnapshot.empty) {
      const doc = userQuerySnapshot.docs[0];
      const data = doc.data();
      console.log('[DEBUG] Found user feedback:', { id: doc.id, data });
      
      return {
        id: doc.id,
        interviewId: data.interviewId,
        userId: data.userId,
        feedback: data.detailedFeedback || data.feedback || "No feedback available.",
        communication: data.communication || 0,
        technicalKnowledge: data.technicalKnowledge || 0,
        problemSolving: data.problemSolving || 0,
        confidence: data.confidence || 0,
        overallScore: data.overallScore || 0,
        strengths: data.strengths || [],
        areasForImprovement: data.areasForImprovement || [],
        status: data.status || "completed",
        transcript: data.transcript || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }
    
    console.log('[DEBUG] No feedback found for this user either');
    return null;
    
  } catch (error) {
    console.error("[ERROR] in getFeedbackByInterviewId:", error);
    throw new Error(`Failed to fetch feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches the most recent interviews with an optional limit
 * @param params Object containing limit and optionally userId
 * @returns Array of the most recent interview documents
 */
export async function getLatestInterviews(
  params: { limit?: number; userId?: string } = {}
): Promise<Interview[]> {
  try {
    const { limit = 20, userId } = params;
    console.log(`[DEBUG] Fetching latest ${limit} interviews` + (userId ? ` for user ${userId}` : ''));
    
    const { db, collection, query, where, getDocs, orderBy, limit: limitQuery } = await import("@/lib/firebase");
    const interviewsRef = collection(db, "interviews");
    
    // Build the base query
    let q = query(
      interviewsRef,
      orderBy("createdAt", "desc"),
      limitQuery(limit)
    );
    
    // Add user filter if userId is provided
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }
    
    const querySnapshot = await getDocs(q);
    
    console.log(`[DEBUG] Found ${querySnapshot.size} interviews`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to JavaScript Date objects
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    })) as Interview[];
    
  } catch (error) {
    console.error("[ERROR] in getLatestInterviews:", error);
    throw new Error(`Failed to fetch latest interviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches all interviews for a specific user
 * @param userId The ID of the user to fetch interviews for
 * @returns Array of interview documents for the user
 */
export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  try {
    console.log(`[DEBUG] Fetching interviews for user: ${userId}`);
    
    const { db, collection, query, where, getDocs, orderBy } = await import("@/lib/firebase");
    const interviewsRef = collection(db, "interviews");
    
    // Query for interviews where userId matches
    const q = query(
      interviewsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // Most recent first
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`[DEBUG] Found ${querySnapshot.size} interviews for user ${userId}`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to JavaScript Date objects
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
    })) as Interview[];
    
  } catch (error) {
    console.error("[ERROR] in getInterviewsByUserId:", error);
    throw new Error(`Failed to fetch user interviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

import { evaluateInterviewPerformance } from "@/lib/utils/evaluation";

/**
 * Saves feedback to Firestore
 * @param params Object containing feedback data
 * @returns Object with success status and feedback ID
 */
export async function createFeedbackWithFirebase(
  params: {
    interviewId: string;
    userId: string;
    transcript: Array<{ role: string; content: string }>;
    jobRole?: string;
    feedbackId?: string;
  }
): Promise<{ success: boolean; feedbackId: string | null; error?: string }> {
  try {
    const { interviewId, userId, transcript, jobRole = 'Software Engineer', feedbackId } = params;
    console.log(`[DEBUG] Saving feedback for interview: ${interviewId}, user: ${userId}`);
    
    // Import Firebase functions with error handling
    let firebase;
    try {
      firebase = await import("@/lib/firebase");
      console.log('[DEBUG] Firebase imported successfully');
    } catch (importError) {
      console.error('[ERROR] Failed to import Firebase:', importError);
      throw new Error('Failed to initialize Firebase');
    }
    
    const { db, doc, setDoc, serverTimestamp, collection } = firebase;
    
    try {
      // Create or update feedback document
      console.log('[DEBUG] Creating feedback document reference');
      const feedbacksCollection = collection(db, 'feedbacks');
      const feedbackRef = feedbackId 
        ? doc(feedbacksCollection, feedbackId)
        : doc(feedbacksCollection);
      
      console.log('[DEBUG] Preparing initial feedback data');
      const initialData = {
        interviewId: interviewId.trim(),
        userId,
        transcript: JSON.stringify(transcript),
        status: 'processing', // Initial status
        jobRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('[DEBUG] Saving initial feedback data to Firestore...');
      await setDoc(feedbackRef, initialData, { merge: true });
      
      console.log(`[DEBUG] Feedback document created/updated with ID: ${feedbackRef.id}`);
      
      // Process transcript to extract Q&A pairs
      console.log('[DEBUG] Processing transcript for evaluation...');
      const qaPairs = [];
      let currentQuestion = '';
      
      for (const entry of transcript) {
        if (entry.role === 'assistant' && entry.content) {
          // This is a question from the interviewer
          currentQuestion = entry.content;
        } else if (entry.role === 'user' && currentQuestion) {
          // This is an answer from the candidate
          qaPairs.push({
            question: currentQuestion,
            answer: entry.content || ''
          });
          currentQuestion = ''; // Reset for next Q&A pair
        }
      }
      
      console.log(`[DEBUG] Extracted ${qaPairs.length} Q&A pairs from transcript`);
      
      // Generate evaluation using Gemini
      console.log('[DEBUG] Generating evaluation with Gemini...');
      const evaluation = await evaluateInterviewPerformance(qaPairs, jobRole);
      
      console.log('[DEBUG] Evaluation completed, updating feedback...');
      
      // Prepare the feedback update
      const feedbackUpdate = {
        ...evaluation,
        status: 'completed',
        evaluatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Update the feedback with evaluation
      await setDoc(feedbackRef, feedbackUpdate, { merge: true });
      
      console.log('[DEBUG] Feedback updated with evaluation');
      
      return {
        success: true,
        feedbackId: feedbackRef.id,
      };
      
    } catch (evaluationError) {
      console.error('[ERROR] Error during feedback generation:', evaluationError);
      
      // Update status to indicate failure
      await setDoc(feedbackRef, {
        status: 'error',
        error: evaluationError.message,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      throw new Error(`Failed to generate feedback: ${evaluationError.message}`);
    }
    
  } catch (error) {
    console.error("[ERROR] in createFeedbackWithFirebase:", error);
    return {
      success: false,
      feedbackId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ... (rest of the code remains the same)
