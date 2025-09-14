"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { interviewer } from "@/constants";
import { testBackendConnection, testGeminiAPI, testGeminiGenerateObject, testMongoDB, createFeedbackWithFirebase } from "@/lib/actions/general.action";
import { API_BASE_URL } from "@/lib/api";
import Vapi from "@vapi-ai/web";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [vapiConfig, setVapiConfig] = useState<any>(null);
  const [vapiToken, setVapiToken] = useState<string>("");
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Fetch Vapi config and token from backend
  useEffect(() => {
    const fetchVapiData = async () => {
      try {
        const [configResponse, tokenResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/ai/vapi-config`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/ai/vapi-token`, { credentials: "include" }),
        ]);

        if (configResponse.ok) {
          const config = await configResponse.json();
          setVapiConfig(config);
        }

        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          setVapiToken(token);
          // Initialize Vapi instance with the token
          setVapi(new Vapi(token));
        }
      } catch (error) {
        console.error("Failed to fetch Vapi data:", error);
      }
    };
    fetchVapiData();
  }, []);

  useEffect(() => {
    if (!vapi) return;

    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended. Waiting briefly for final transcripts...");
      // Small delay to ensure transcripts are flushed before FINISHED
      setTimeout(() => {
        setCallStatus(CallStatus.FINISHED);
      }, 1500);
    };

    const onMessage = (message: Message) => {
      console.log("Received message:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        console.log("Adding message to transcript:", newMessage);
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          console.log("Updated messages array:", updated);
          return updated;
        });
      } else if (message.type === "transcript" && message.transcriptType === "partial") {
        // Also capture partial transcripts for better coverage
        console.log("Partial transcript:", message.transcript);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [vapi]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback - Starting feedback generation");
      console.log("Messages:", messages);
      console.log("Interview ID:", interviewId);
      console.log("User ID:", userId);

      setIsGeneratingFeedback(true);

      try {
        const { success, feedbackId: id, error } = await createFeedbackWithFirebase({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        console.log("Firebase feedback result:", { success, id, error });
        
        if (error) {
          console.error("Detailed error:", error);
        }

        if (success && id) {
          console.log("Feedback generated successfully, redirecting to feedback page");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.log("Error saving feedback - success:", success, "id:", id);
          // Still redirect to feedback page, but with error state
          router.push(`/interview/${interviewId}/feedback?error=generation_failed`);
        }
      } catch (error) {
        console.error("Error in handleGenerateFeedback:", error);
        // Still redirect to feedback page, but with error state
        router.push(`/interview/${interviewId}/feedback?error=generation_failed`);
      } finally {
        setIsGeneratingFeedback(false);
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        // Add a small delay to ensure all messages are captured
        setTimeout(() => {
          console.log("Call finished, generating feedback with messages:", messages);
          if (messages.length > 0) {
            handleGenerateFeedback(messages);
          } else {
            console.log("No messages captured, cannot generate feedback");
            // Still redirect to feedback page, but with error state
            router.push(`/interview/${interviewId}/feedback?error=no_transcript`);
          }
        }, 1000);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    if (!vapiConfig || !vapi) {
      console.error("Vapi config or instance not loaded");
      return;
    }

    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(vapiConfig.id, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleEndCall = async () => {
    if (!interviewId || !userId) {
      console.error("Missing interviewId or userId");
      return;
    }

    setIsGeneratingFeedback(true);
    
    // Format transcript as an array of message objects
    const transcriptToSend = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      console.log("Sending transcripts to Firebase...");
      const { success, feedbackId: id, error } = await createFeedbackWithFirebase({
        interviewId,
        userId,
        transcript: transcriptToSend,
        feedbackId,
      });

      console.log("Feedback generation result:", { success, id, error });

      if (success && id) {
        console.log("Ending call and preparing to redirect...");
        
        // Show a message to the user
        alert("Interview completed! Generating feedback...");
        
        // Add a 5-second delay before redirecting
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Force redirect to the feedback page
        window.location.href = `/interview/${interviewId}/feedback`;
        return; // Exit early to prevent further execution
      } else {
        console.error("Failed to generate feedback:", error);
        alert("Failed to generate feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error generating feedback:", err);
      alert("An error occurred while generating feedback. Please check the console for details.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {isGeneratingFeedback && (
        <div className="flex justify-center items-center py-4">
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-600 font-medium">
              Generating feedback report...
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center m-8">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={isGeneratingFeedback}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {isGeneratingFeedback
                ? "Generating..."
                : callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button
            className="btn-disconnect"
            onClick={() => handleEndCall()}
            disabled={isGeneratingFeedback}
          >
            {isGeneratingFeedback ? "Generating..." : "End"}
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
