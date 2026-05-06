"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

/**
 * Hook that redirects to /login if the user is not authenticated.
 * Returns { user, loading, username } for convenience.
 */
export function useRequireAuth() {
  const { user, loading, username, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return { user, loading, username, logout };
}
