"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { applyTheme, ThemeName, themeMeta } from "@/lib/themes";
import { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Check, Palette, LogOut } from "lucide-react";

const themeNames = Object.keys(themeMeta) as ThemeName[];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [savedTheme, setSavedTheme] = useState<ThemeName>("noir-red");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("noir-red");
  const [saving, setSaving] = useState(false);
  const savedThemeRef = useRef<ThemeName>("noir-red");

  // Keep ref in sync to revert preview on unmount
  useEffect(() => {
    savedThemeRef.current = savedTheme;
  }, [savedTheme]);

  // Load saved theme on load
  useEffect(() => {
    if (!user) return;

    // 1. Check local storage
    const stored = localStorage.getItem(`theme_${user.uid}`) as ThemeName | null;
    if (stored && themeMeta[stored]) {
      setSavedTheme(stored);
      setSelectedTheme(stored);
    }

    // 2. Fetch from Firestore
    const fetchTheme = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().theme) {
          const themeName = userDoc.data().theme as ThemeName;
          setSavedTheme(themeName);
          setSelectedTheme(themeName);
          localStorage.setItem(`theme_${user.uid}`, themeName);
          applyTheme(themeName);
        }
      } catch (e) {
        console.error("Error fetching theme", e);
      }
    };
    fetchTheme();
  }, [user]);

  // Cleanup on unmount: revert if they navigated away without saving
  useEffect(() => {
    return () => {
      applyTheme(savedThemeRef.current);
    };
  }, []);

  const handleThemePreview = (themeName: ThemeName) => {
    applyTheme(themeName);
    setSelectedTheme(themeName);
  };

  const handleSaveChanges = async () => {
    if (!user || selectedTheme === savedTheme) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { theme: selectedTheme },
        { merge: true }
      );
      localStorage.setItem(`theme_${user.uid}`, selectedTheme);
      setSavedTheme(selectedTheme);
    } catch (e) {
      console.error("Error saving theme", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza tu experiencia en TareasCasa
        </p>
      </div>

      {/* Theme selector */}
      <Card className="border-border bg-card mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-lg bg-primary/15 p-2">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Tema visual</h2>
              <p className="text-sm text-muted-foreground">
                Elige el esquema de colores que más te guste
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themeNames.map((name) => {
              const meta = themeMeta[name];
              const isActive = selectedTheme === name;
              return (
                <button
                  key={name}
                  onClick={() => handleThemePreview(name)}
                  className={`
                    relative flex flex-col items-center gap-2 rounded-xl border-2 p-4
                    transition-all duration-200
                    ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }
                  `}
                >
                  {/* Color preview circle */}
                  <div
                    className="h-10 w-10 rounded-full shadow-inner ring-2 ring-white/10"
                    style={{ backgroundColor: meta.preview }}
                  />
                  <span className="text-xs font-medium">{meta.label}</span>
                  {isActive && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveChanges} 
              disabled={selectedTheme === savedTheme || saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account section */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Cuenta</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Correo electrónico</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
