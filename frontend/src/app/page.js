"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    hasRedirected.current = true;

    if (user) {
      switch (user.role) {
        case "admin":
          router.replace("/dashboard/admin");
          break;

        case "owner":
          router.replace("/dashboard/owner");
          break;

        default:
          router.replace("/dashboard/user/homepage");
      }
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}