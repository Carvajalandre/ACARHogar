"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";

function translateFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "Este correo ya está registrado.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/operation-not-allowed": "El registro está deshabilitado temporalmente.",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento.",
  };
  return map[code] || "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("El nombre de usuario solo puede contener letras, números y guiones bajos.");
      return;
    }

    setIsLoading(true);
    try {
      // Verificar si el username ya existe
      const usernameRef = doc(db, "usernames", trimmedUsername.toLowerCase());
      const usernameSnap = await getDoc(usernameRef);
      if (usernameSnap.exists()) {
        setError("El nombre de usuario ya está en uso.");
        setIsLoading(false);
        return;
      }
      // Crear usuario en Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: trimmedUsername });
      // Guardar datos en Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        username: trimmedUsername,
        email,
        householdId: "",
        points: 0,
        role: "member",
        vacation: false,
        createdAt: new Date().toISOString(),
      });
      // Reservar el username
      await setDoc(usernameRef, { uid: userCred.user.uid });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Firebase Auth Error:", err);
      const firebaseErr = err as { code?: string; message?: string };
      const translated = translateFirebaseError(firebaseErr.code || "");
      // If it's the generic error, append the original message so we can see what's wrong
      if (translated.includes("Ocurrió un error inesperado") && firebaseErr.message) {
        setError(`${translated} Detalle: ${firebaseErr.message}`);
      } else {
        setError(translated);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Empieza a organizar las tareas de tu hogar
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="ej: maria_casa"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}