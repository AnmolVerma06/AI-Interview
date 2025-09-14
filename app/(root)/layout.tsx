import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import { UserDropdown } from "@/components/UserDropdown";

export const dynamic = 'force-dynamic';

const Layout = async ({ children }: { children: ReactNode }) => {
  // Don't block rendering while checking auth
  const user = await getCurrentUser().catch(() => null);
  const isUserAuthenticated = !!user;
  
  // If not authenticated, redirect to sign-in
  if (!isUserAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout min-h-screen flex flex-col">
      <nav className="w-full border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.svg" 
              alt="MockMate Logo" 
              width={48} 
              height={42} 
              className="w-12 h-auto"
            />
            <h2 className="text-primary-100 text-2xl font-semibold">PrepWise</h2>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <UserDropdown user={{
                name: user.name || null,
                email: user.email || null,
                image: user.image || null,
              }} />
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
