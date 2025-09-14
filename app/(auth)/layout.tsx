import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const dynamic = 'force-dynamic';

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  try {
    // Check if user is already authenticated
    const user = await getCurrentUser();
    if (user) {
      redirect("/");
    }
  } catch (error) {
    // If there's an error (like 401), continue with the auth layout
    console.error("Auth check failed:", error);
  }

  return (
    <div className="auth-layout min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
