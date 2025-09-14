"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Feedback = {
  id: string;
  interviewId: string;
  userId: string;
  status: 'processing' | 'completed' | 'error';
  communication?: number;
  technicalKnowledge?: number;
  problemSolving?: number;
  confidence?: number;
  overallScore?: number;
  strengths?: string[];
  areasForImprovement?: string[];
  detailedFeedback?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/sign-in");
        return null;
      }
  
      const interviewId = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!interviewId) {
        setError("Interview ID is missing");
        return null;
      }
  
      console.log("Fetching feedback for interview:", interviewId);
      const feedbackData = await getFeedbackByInterviewId({
        interviewId,
        userId: user.id,
      });
  
      if (!feedbackData) {
        setError("Feedback not found");
        return null;
      }
  
      console.log("Raw feedback data:", feedbackData);
  
      // Handle both Firestore patterns:
      // 1. Flat: feedbackData.communication
      // 2. Nested: feedbackData.data.communication
      const rawData = feedbackData.data ? feedbackData.data : feedbackData;
  
      // Convert Firestore Timestamps if they exist
      const toDate = (ts: any) =>
        ts && ts.seconds ? new Date(ts.seconds * 1000) : new Date();
  
      const processedFeedback: Feedback = {
        id: feedbackData.id,
        interviewId: feedbackData.interviewId,
        userId: feedbackData.userId,
        status: rawData.status || feedbackData.status || "completed",
  
        // Scores
        communication: rawData.communication ?? 3,
        technicalKnowledge: rawData.technicalKnowledge ?? 3,
        problemSolving: rawData.problemSolving ?? 3,
        confidence: rawData.confidence ?? 3,
        overallScore: rawData.overallScore ?? 3,
  
        // Arrays
        strengths:
          Array.isArray(rawData.strengths) && rawData.strengths.length > 0
            ? rawData.strengths
            : ["Good effort in the interview"],
        areasForImprovement:
          Array.isArray(rawData.areasForImprovement) &&
          rawData.areasForImprovement.length > 0
            ? rawData.areasForImprovement
            : ["No specific areas for improvement were identified."],
  
        // Detailed feedback
        detailedFeedback:
          typeof rawData.detailedFeedback === "string"
            ? rawData.detailedFeedback
            : rawData.feedback && rawData.feedback !== "No feedback available."
            ? rawData.feedback
            : "Thank you for completing the interview.",
  
        error: feedbackData.error,
        createdAt: toDate(rawData.createdAt || feedbackData.createdAt),
        updatedAt: toDate(rawData.updatedAt || feedbackData.updatedAt),
      };
  
      console.log("Processed feedback:", processedFeedback);
      setFeedback(processedFeedback);
      return processedFeedback;
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const loadFeedback = async () => {
      try {
        setLoading(true);
        await fetchFeedback();
      } catch (err) {
        console.error('Error loading feedback:', err);
        setError('Failed to load feedback. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeedback();

    // Set up polling if feedback is still processing
    if (feedback?.status === 'processing') {
      const pollInterval = setInterval(() => {
        if (isMounted) {
          fetchFeedback();
        }
      }, 5000); // Poll every 5 seconds

      return () => {
        clearInterval(pollInterval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Loading Feedback</h1>
        <p className="text-muted-foreground">Please wait while we load your feedback...</p>
        <div className="mt-4">
          <Progress value={33} className="h-2 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchFeedback();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Feedback Not Found</h1>
        <p className="text-muted-foreground">We couldn't find the feedback for this interview.</p>
        <Button 
          className="mt-4" 
          onClick={() => {
            setLoading(true);
            fetchFeedback();
          }}
        >
          Refresh
        </Button>
      </div>
    );
  }

  if (feedback.status === 'processing') {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Processing Your Feedback</h1>
        <p className="text-muted-foreground">We're still analyzing your interview. This may take a moment...</p>
        <div className="mt-4">
          <Progress value={66} className="h-2 w-full" />
        </div>
        <Button 
          className="mt-4" 
          onClick={() => {
            setLoading(true);
            fetchFeedback();
          }}
        >
          Check Status
        </Button>
      </div>
    );
  }

  if (feedback.status === 'error') {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Generating Feedback</h1>
        <p className="text-muted-foreground">
          {feedback.error || 'An error occurred while generating your feedback.'}
        </p>
        <Button 
          className="mt-4" 
          onClick={() => {
            setLoading(true);
            fetchFeedback();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto p-0">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-8 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Interview Feedback</h1>
            <div className="text-5xl font-bold text-primary-400 mb-2">
              {feedback.overallScore?.toFixed(1)}/5.0
            </div>
            <div className="text-gray-300">Overall Performance</div>
          </div>
        </div>

        <div className="space-y-4 px-4">
          {/* Skills Assessment */}
          <Card className="border-gray-800 bg-gray-900 shadow-sm">
            <CardHeader className="pb-2 px-6 pt-4">
              <CardTitle className="text-xl text-white">Skills Assessment</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 pt-0">
              {[
                { label: 'Communication', value: feedback.communication },
                { label: 'Technical Knowledge', value: feedback.technicalKnowledge },
                { label: 'Problem Solving', value: feedback.problemSolving },
                { label: 'Confidence', value: feedback.confidence },
              ].map((skill) => (
                <div key={skill.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{skill.label}</span>
                    <span className="font-medium text-white">{skill.value?.toFixed(1)}/5.0</span>
                  </div>
                  <Progress 
                    value={(skill.value || 0) * 20} 
                    className="h-2 bg-gray-800"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-gray-800 bg-gray-900 shadow-sm">
              <CardHeader className="pb-2 px-6 pt-4">
                <CardTitle className="text-lg text-green-400">Strengths</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-4 pt-0">
                <ul className="space-y-3">
                  {feedback.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start text-gray-200">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="border-gray-800 bg-gray-900 shadow-sm">
              <CardHeader className="pb-2 px-6 pt-4">
                <CardTitle className="text-lg text-amber-400">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-4 pt-0">
                <ul className="space-y-3">
                  {feedback.areasForImprovement?.map((area, i) => (
                    <li key={i} className="flex items-start text-gray-200">
                      <span className="text-amber-500 mr-2 mt-1">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <Card className="border-gray-800 bg-gray-900 shadow-sm">
            <CardHeader className="pb-2 px-6 pt-4">
              <CardTitle className="text-xl text-white">Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 pt-0">
              <div className="prose prose-invert max-w-none text-gray-300">
                {feedback.detailedFeedback?.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
  <Button 
    variant="outline" 
    className="px-6 py-3 text-base bg-transparent border-gray-700 hover:bg-gray-800 hover:border-gray-600"
    onClick={() => router.push('/')}
  >
    Back to Dashboard
  </Button>
  <Button 
    className="px-6 py-3 text-base bg-primary hover:bg-primary/90"
    onClick={() => router.push('/interview')}
  >
    Retry Interview
  </Button>
</div>
    </div>
  );
}
