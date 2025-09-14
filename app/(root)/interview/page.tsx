import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from 'uuid';

const Page = async () => {
  const user = await getCurrentUser();
  const interviewId = uuidv4();
  
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Please sign in to start an interview</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Start Your Interview</h1>
      <div className="bg-transparent rounded-lg shadow-md p-6 mb-6 m-8">
        <Agent
          userName={user.name || 'User'}
          userId={user.id}
          interviewId={interviewId}
          feedbackId={undefined}
          type="generate"
          questions={[]}
        />
      </div>
    </div>
  );
  
  
};

export default Page;
