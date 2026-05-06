"use client";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Star, Gift, CalendarDays, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";

export default function DashboardPage() {
  const { user, username } = useRequireAuth();
  const [pendingTasks, setPendingTasks] = useState(0);
  const [points, setPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPoints(userData.points || 0);
          // Obtener tareas pendientes del hogar del usuario (si tiene householdId)
          if (userData.householdId) {
            const tasksQuery = query(
              collection(db, "tasks"),
              where("householdId", "==", userData.householdId),
              where("status", "==", "todo")
            );
            const tasksSnap = await getDocs(tasksQuery);
            setPendingTasks(tasksSnap.size);
            // Recompensas disponibles
            const rewardsQuery = query(
              collection(db, "rewards"),
              where("householdId", "==", userData.householdId)
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
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold lg:text-3xl">
          {greeting()}, {username || user?.displayName || "Usuario"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aquí tienes un resumen de tu hogar.
        </p>
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