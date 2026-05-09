"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function AuthWrapper({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/login", "/register", "/forgot-password"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      // Redirect to login if not authenticated and not on public page
      router.replace('/login');
    } else if (user && isPublicPath) {
      // Redirect to appropriate dashboard if authenticated and trying to access auth pages
      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'owner') {
        router.replace('/dashboard/owner');
      } else {
        router.replace('/dashboard/user/homepage');
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to public paths without authentication
  const publicPaths = ["/login", "/register", "/forgot-password"];
  if (publicPaths.includes(pathname)) {
    return children;
  }

  // Protect private routes
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}