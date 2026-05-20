"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Task, updateTaskStatus, deleteTask } from "@/lib/firebase/tasks";
import { getHomeMembers } from "@/lib/firebase/homes";
import { CheckCircle2, Circle, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user, householdId } = useRequireAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!householdId) return;

    // Load members
    getHomeMembers(householdId).then(setMembers);

    // Listen to tasks
    const q = query(collection(db, "tasks"), where("householdId", "==", householdId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [householdId]);

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return "Sin asignar";
    const member = members.find(m => m.id === assignedTo);
    return member ? (member.username || member.displayName || "Usuario") : "Desconocido";
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!task.id) return;
    const newStatus = task.status === "todo" ? "completed" : "todo";
    await updateTaskStatus(task.id, newStatus, task.points, user?.uid);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      await deleteTask(taskId);
    }
  };

  // Local date formatting YYYY-MM-DD
  const selectedDateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : null;
  const dayTasks = tasks.filter(t => t.dueDate === selectedDateStr);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Visualiza las tareas programadas por día
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        {/* Day detail */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl bg-primary/10 p-5 mb-5">
              <CalendarDays className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {date
                ? date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Selecciona un día"}
            </h2>
            
            {dayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No hay tareas programadas para este día.
              </p>
            ) : (
              <div className="w-full max-w-xl mt-6 space-y-3">
                {dayTasks.map(task => (
                  <Card key={task.id} className={`transition-all ${task.status === "completed" ? "opacity-60 bg-muted/50" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <button 
                        onClick={() => toggleTaskStatus(task)}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className={`font-semibold text-sm sm:text-base truncate ${task.status === "completed" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {task.points} pts
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                            {getAssigneeName(task.assignedTo)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => router.push('/tasks')}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTask(task.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
