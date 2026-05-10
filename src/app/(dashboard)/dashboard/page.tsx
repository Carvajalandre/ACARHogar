"use client";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, Star, Gift, CalendarDays, ArrowRight, Home, Users, Plus, Key } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { createHome, joinHome, getHomeDetails, Home as HomeType } from "@/lib/firebase/homes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { user, username, householdId, refreshUser } = useRequireAuth();
  const [pendingTasks, setPendingTasks] = useState(0);
  const [points, setPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeDetails, setHomeDetails] = useState<HomeType | null>(null);

  const [createHomeName, setCreateHomeName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points || 0);
          
          if (householdId) {
            // Load home details
            const home = await getHomeDetails(householdId);
            setHomeDetails(home);

            // Obtener tareas pendientes del hogar del usuario
            const tasksQuery = query(
              collection(db, "tasks"),
              where("householdId", "==", householdId),
              where("status", "==", "todo")
            );
            const tasksSnap = await getDocs(tasksQuery);
            setPendingTasks(tasksSnap.size);
            
            // Recompensas disponibles (solo tipo 'reward')
            const rewardsQuery = query(
              collection(db, "rewards"),
              where("householdId", "==", householdId),
              where("type", "==", "reward")
            );
            const rewardsSnap = await getDocs(rewardsQuery);
            setAvailableRewards(rewardsSnap.size);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, householdId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createHomeName.trim() || !user) return;
    setActionLoading(true);
    setErrorMsg("");
    try {
      await createHome(createHomeName.trim(), user.uid);
      await refreshUser(); // Context refreshes to get householdId
    } catch (err: any) {
      setErrorMsg(err.message || "Error al crear el hogar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !user) return;
    setActionLoading(true);
    setErrorMsg("");
    try {
      const res = await joinHome(joinCodeInput.trim(), user.uid);
      if (res.success) {
        await refreshUser();
      } else {
        setErrorMsg(res.error || "Código inválido");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al unirse al hogar");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // --- UI FOR USER WITHOUT HOUSEHOLD ---
  if (!householdId) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">¡Bienvenido a TareasCasa! 🏠</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Para comenzar, necesitas crear un nuevo hogar o unirte a uno existente utilizando un código de invitación.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-destructive/15 p-4 text-sm text-destructive text-center">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Crear un Hogar</CardTitle>
              <CardDescription>
                Crea un nuevo espacio para ti y tu familia. Podrás invitar a otros más tarde.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHome} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del hogar</label>
                  <Input 
                    placeholder="Ej. Familia Pérez" 
                    value={createHomeName}
                    onChange={(e) => setCreateHomeName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={actionLoading || !createHomeName.trim()}>
                  {actionLoading ? "Creando..." : "Crear Hogar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Unirse a un Hogar</CardTitle>
              <CardDescription>
                Ingresa el código de 6 dígitos que te compartió otro miembro del hogar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinHome} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código de invitación</label>
                  <Input 
                    placeholder="123456" 
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <Button variant="secondary" type="submit" className="w-full" disabled={actionLoading || !joinCodeInput.trim()}>
                  {actionLoading ? "Verificando..." : "Unirse"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- UI FOR USER WITH HOUSEHOLD ---
  const statCards = [
    {
      label: "Tareas Pendientes",
      value: pendingTasks,
      sub: "para hoy",
      icon: ClipboardList,
      href: "/tasks",
      color: "text-blue-400",
      bg: "bg-blue-500/15",
    },
    {
      label: "Puntos acumulados",
      value: points,
      sub: "canjeables",
      icon: Star,
      href: "/rewards",
      color: "text-amber-400",
      bg: "bg-amber-500/15",
    },
    {
      label: "Recompensas",
      value: availableRewards,
      sub: "disponibles",
      icon: Gift,
      href: "/rewards",
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">
            {greeting()}, {username || user?.displayName || "Usuario"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <Home className="h-4 w-4" /> 
            {homeDetails?.name ? `Hogar: ${homeDetails.name}` : "Cargando hogar..."}
          </p>
        </div>
        
        {homeDetails && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="p-2 bg-background rounded-md">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Código de Invitación</p>
              <p className="text-xl font-bold text-primary tracking-widest">{homeDetails.joinCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="group border-border bg-card transition-colors hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight">
                      {loading ? "–" : card.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  Ver más <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/tasks">
          <Card className="border-border bg-card transition-colors hover:border-primary/30 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-primary/15 p-3">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Gestionar Tareas</p>
                <p className="text-sm text-muted-foreground">Crea y asigna tareas del hogar</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/calendar">
          <Card className="border-border bg-card transition-colors hover:border-primary/30 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-primary/15 p-3">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Ver Calendario</p>
                <p className="text-sm text-muted-foreground">Revisa las tareas programadas</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}