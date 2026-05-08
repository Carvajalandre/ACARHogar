"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { applyTheme, ThemeName, themeMeta } from "@/lib/themes";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Check, Palette, LogOut } from "lucide-react";

const themeNames = Object.keys(themeMeta) as ThemeName[];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("noir-red");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeName | null;
    if (stored && themeMeta[stored]) {
      setCurrentTheme(stored);
    }

    const handleThemeChange = (e: any) => {
      if (e.detail && themeMeta[e.detail as ThemeName]) {
        setCurrentTheme(e.detail);
      }
    };
    window.addEventListener("theme-changed", handleThemeChange);
    return () => window.removeEventListener("theme-changed", handleThemeChange);
  }, []);

  const handleThemeChangeClick = async (themeName: ThemeName) => {
    applyTheme(themeName);
    setCurrentTheme(themeName);

    // Save to Firestore if logged in
    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { theme: themeName },
          { merge: true }
        );
      } catch (e) {
        console.error("Error saving theme", e);
      }
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
              const isActive = currentTheme === name;
              return (
                <button
                  key={name}
                  onClick={() => handleThemeChangeClick(name)}
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
