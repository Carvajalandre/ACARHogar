"use client";
import { useEffect } from "react";
import { applyTheme, ThemeName } from "@/lib/themes";
import { useAuth } from "@/lib/firebase/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function ThemeLoader() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't attempt Firestore reads while auth is still loading
    if (loading) return;

    const loadTheme = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            applyTheme(userDoc.data().theme as ThemeName);
            return;
          }
        } catch (error) {
          // Silently fall through — Firestore may be blocked by ad-blocker
          // or the user doc may not exist yet (race condition on register)
          console.warn("ThemeLoader: couldn't read user preferences, using local fallback.", error);
        }
      }
      // Fallback: localStorage → default theme
      const stored = localStorage.getItem("theme") as ThemeName | null;
      applyTheme(stored ?? "noir-red");
    };

    loadTheme();
  }, [user, loading]);

  return null;
}