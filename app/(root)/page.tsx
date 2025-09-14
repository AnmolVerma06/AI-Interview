import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id!),
    getLatestInterviews({ userId: user.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

     

      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">Our Story</span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              Transforming the Future of Hiring
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">Who We Are</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are a tech-driven company focused on transforming how organizations hire and grow. With strong roots in finance, operations, and data analytics, we understand the importance of bringing the right talent onboard quickly and efficiently.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional hiring methods for technical skills—like Excel—are slow, inconsistent, and resource-heavy. That's why we built the AI-Powered Excel Mock Interviewer: an intelligent system that simulates real interviews, evaluates responses, and delivers constructive feedback instantly.
                </p>
              </div>
            </div>

            <div className="relative h-80 bg-muted rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold terxt-foreground mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Empowering businesses with intelligent hiring solutions that bridge the gap between talent and opportunity.
                    We're committed to revolutionizing recruitment through cutting-edge AI technology and data-driven insights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Streamline',
                description: 'Hiring pipelines'
              },
              {
                icon: '⚖️',
                title: 'Ensure',
                description: 'Fair evaluations'
              },
              {
                icon: '⏱️',
                title: 'Save',
                description: 'Valuable time'
              },
              {
                icon: '📈',
                title: 'Scale',
                description: 'Business growth'
              }
            ].map((item, index) => (
              <div key={index} className="bg-background p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h4 className="text-lg font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground max-w-3xl mx-auto">
              By combining AI innovation with real-world business needs, we're shaping the future of recruitment—making skill assessments smarter, faster, and more reliable.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        {/* ... */}
      </section>

    </>
  );
}

export default Home;
