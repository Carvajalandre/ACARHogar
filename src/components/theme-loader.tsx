"use client";
import { useEffect } from "react";
import { applyTheme, ThemeName } from "@/lib/themes";
import { useAuth } from "@/lib/firebase/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function ThemeLoader() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const loadTheme = async () => {
      if (user) {
        // Fast local load to avoid flash of default theme
        const storedUserTheme = localStorage.getItem(`theme_${user.uid}`) as ThemeName | null;
        if (storedUserTheme) {
          applyTheme(storedUserTheme);
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            const firestoreTheme = userDoc.data().theme as ThemeName;
            applyTheme(firestoreTheme);
            localStorage.setItem(`theme_${user.uid}`, firestoreTheme);
            return;
          }
        } catch (error) {
          console.warn("ThemeLoader: couldn't read user preferences, using local fallback.", error);
        }
      } else {
        // If logged out, reset to the default theme (noir-red)
        applyTheme("noir-red");
      }
    };

    loadTheme();
  }, [user, loading]);

  return null;
}