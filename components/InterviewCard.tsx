import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`} className="block">
      <div className="card-border w-full min-h-96 hover:shadow-md transition-shadow duration-200">
        <div className="card-interview">
          <div>
            {/* Type Badge */}
            <div
              className={cn(
                "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
                badgeColor
              )}
            >
              <p className="badge-text">{normalizedType}</p>
            </div>

            {/* Cover Image */}
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={90}
              height={90}
              className="rounded-full object-fit size-[90px]"
            />

            {/* Interview Role */}
            <h3 className="mt-5 capitalize">{role} Interview</h3>

            {/* Date & Score */}
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Image src="/calendar.svg" width={16} height={16} alt="calendar" />
                <span>{formattedDate}</span>
              </div>

              {feedback ? (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Overall:</span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">
                        {feedback.overallScore?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">/5.0</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Com: {feedback.communication?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Tech: {feedback.technicalKnowledge?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Prob: {feedback.problemSolving?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Conf: {feedback.confidence?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image src="/star.svg" width={16} height={16} alt="star" />
                  <span>No feedback yet</span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="mt-3">
              {feedback ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Completed with Feedback
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Incomplete - Click to Continue
                </span>
              )}
            </div>

            {/* Feedback or Placeholder Text */}
            <p className="line-clamp-2 mt-3 text-sm text-muted-foreground">
              {feedback?.detailedFeedback?.split('\n')[0].substring(0, 100) + '...' ||
               "Take this interview to get detailed feedback on your performance."}
            </p>
          </div>
          <Button className="w-full mt-4" variant={feedback ? "outline" : "default"}>
            {feedback ? "View Full Report" : "Continue Interview"}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default InterviewCard;
