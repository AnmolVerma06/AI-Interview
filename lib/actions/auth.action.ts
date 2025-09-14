"use server";

import { cookies } from "next/headers";
import { api } from "@/lib/api";

export async function signUpBackend(name: string, email: string, password: string) {
  try {
    await api(`/auth/sign-up`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return { success: true, message: "Account created successfully. Please sign in." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to create account." };
  }
}

export async function signInBackend(email: string, password: string) {
  try {
    await api(`/auth/sign-in`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to sign in." };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  try {
    // Call the backend sign-out endpoint
    await api(`/auth/sign-out`, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear any remaining cookies on the client side
    const cookieStore = await cookies();
    cookieStore.delete("session");
    
    // Force a hard redirect to ensure all auth state is cleared
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during sign out:', error);
    
    // Even if there's an error, try to clear local state and redirect
    if (typeof window !== 'undefined') {
      const cookieStore = await cookies();
      cookieStore.delete("session");
      window.location.href = '/sign-in';
    }
    
    return { success: false, message: 'Failed to sign out. Please try again.' };
  }
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.get("session")?.value ? `session=${cookieStore.get("session")?.value}` : undefined;
    
    if (!cookieHeader) {
      return null;
    }
    
    const me = await api(`/auth/me`, { 
      method: "GET", 
      cookiesHeader: cookieHeader 
    }).catch(() => null);
    
    if (!me) return null;
    return { id: me.id, name: me.name, email: me.email } as User;
  } catch (error) {
    // If there's any error (including 401), return null
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
