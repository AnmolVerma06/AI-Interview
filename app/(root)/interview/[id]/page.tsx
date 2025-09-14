import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import PDFDownloadButton from "@/components/PDFDownloadButton";

const Feedback = async ({
  params,
  searchParams,
}: RouteParams & { searchParams: { error?: string } }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  // Try fetching interview
  const interview = await getInterviewById(id);

  // Fetch feedback if available
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Interview Feedback
          </h1>
          {interview?.role && (
            <p className="mt-3 text-xl text-gray-600">
              {interview.role} Interview • {dayjs(interview.createdAt).format('MMMM D, YYYY')}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error === 'interview_not_found' 
                ? 'The requested interview could not be found.' 
                : 'An error occurred while loading the interview.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Interview Details Card */}
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="mt-1 text-gray-900">{interview?.role || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-gray-900">
                    {interview?.createdAt ? dayjs(interview.createdAt).format('MMMM D, YYYY') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-gray-900">
                    {feedback?.status === 'completed' ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Overall Score</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {feedback?.overallScore ? `${feedback.overallScore.toFixed(1)}/5.0` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button variant="outline" asChild>
              <Link href="/interview">
                Back to Interviews
              </Link>
            </Button>
            {feedback && (
              <PDFDownloadButton 
                interviewId={id}
                role={interview?.role || 'Interview'}
                feedback={feedback}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
