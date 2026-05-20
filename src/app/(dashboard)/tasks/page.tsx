"use client";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Trash2, Edit2, CheckCircle2, Circle, Calendar as CalendarIcon } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Task, TaskTemplate, createTask, updateTask, updateTaskStatus, deleteTask, createTaskTemplate } from "@/lib/firebase/tasks";
import { getHomeMembers } from "@/lib/firebase/homes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function TasksPage() {
  const { user, householdId } = useRequireAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  
  // Create task form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    points: 10,
    assignedTo: "unassigned",
    dueDate: "",
    saveAsTemplate: false,
    templateId: "none"
  });

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    // Load members
    getHomeMembers(householdId).then(setMembers);

    // Listen to tasks
    const q = query(collection(db, "tasks"), where("householdId", "==", householdId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedTasks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      // Sort by creation date (newest first)
      fetchedTasks.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setTasks(fetchedTasks);
      setLoading(false);
    });

    // Listen to templates
    const templatesQuery = query(collection(db, "taskTemplates"), where("householdId", "==", householdId));
    const unsubscribeTemplates = onSnapshot(templatesQuery, (snap) => {
      const fetchedTemplates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskTemplate));
      setTemplates(fetchedTemplates);
    });

    return () => {
      unsubscribe();
      unsubscribeTemplates();
    };
  }, [householdId]);

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") {
      setNewTask(prev => ({ ...prev, templateId, title: "", description: "", points: 10, saveAsTemplate: false }));
      return;
    }
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewTask(prev => ({
        ...prev,
        templateId,
        title: template.title,
        description: template.description || "",
        points: template.points,
        saveAsTemplate: false
      }));
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !householdId || !newTask.title.trim()) return;

    if (editingTaskId) {
      await updateTask(editingTaskId, {
        title: newTask.title,
        description: newTask.description,
        points: Number(newTask.points) || 0,
        assignedTo: newTask.assignedTo === "unassigned" ? null : newTask.assignedTo,
        dueDate: newTask.dueDate || undefined,
      });
    } else {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        points: Number(newTask.points) || 0,
        assignedTo: newTask.assignedTo === "unassigned" ? null : newTask.assignedTo,
        dueDate: newTask.dueDate || undefined,
        createdBy: user.uid,
        householdId: householdId,
      });

      if (newTask.saveAsTemplate && newTask.templateId === "none") {
        await createTaskTemplate({
          title: newTask.title,
          description: newTask.description,
          points: Number(newTask.points) || 0,
          createdBy: user.uid,
          householdId: householdId,
        });
      }
    }

    setIsDialogOpen(false);
    setEditingTaskId(null);
    setNewTask({ title: "", description: "", points: 10, assignedTo: "unassigned", dueDate: "", saveAsTemplate: false, templateId: "none" });
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!task.id) return;
    const newStatus = task.status === "todo" ? "completed" : "todo";
    // We award points to the user who marks it as completed (or removes it)
    await updateTaskStatus(task.id, newStatus, task.points, user?.uid);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      await deleteTask(taskId);
    }
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return "Sin asignar";
    const member = members.find(m => m.id === assignedTo);
    return member ? (member.username || member.displayName || "Usuario") : "Desconocido";
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl bg-primary/10 p-5 mb-5">
              <ClipboardList className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No perteneces a ningún hogar</h2>
            <p className="max-w-sm text-center text-sm text-muted-foreground mb-6">
              Debes crear un hogar o unirte a uno existente para poder gestionar tareas.
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">Ir al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === "todo");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const myTasks = todoTasks.filter(t => t.assignedTo === user?.uid);

  const renderTaskList = (list: Task[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border/50">
          <p>No hay tareas en esta sección.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {list.map(task => (
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
              
              <div className="flex-1 min-w-0">
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
                  {task.dueDate && (
                    <span className="text-muted-foreground flex items-center gap-1 ml-2">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(task.dueDate + "T00:00:00").toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" 
                  onClick={() => {
                    setEditingTaskId(task.id!);
                    setNewTask({
                      title: task.title,
                      description: task.description || "",
                      points: task.points,
                      assignedTo: task.assignedTo || "unassigned",
                      dueDate: task.dueDate || "",
                      saveAsTemplate: false,
                      templateId: "none"
                    });
                    setIsDialogOpen(true);
                  }}
                >
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
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tareas del Hogar</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y asigna las tareas a los miembros de la familia
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTaskId(null);
            setNewTask({ title: "", description: "", points: 10, assignedTo: "unassigned", dueDate: "", saveAsTemplate: false, templateId: "none" });
          }
        }}>
          <DialogTrigger 
            render={
              <Button className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Nueva Tarea
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTaskId ? "Editar Tarea" : "Crear Nueva Tarea"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveTask} className="space-y-4 pt-4">
              {templates.length > 0 && !editingTaskId && (
                <div className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                  <label className="text-sm font-medium">Usar una plantilla (Opcional)</label>
                  <Select value={newTask.templateId} onValueChange={(v) => handleTemplateSelect(v || "none")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plantilla (Crear desde 0)</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id!}>
                          {t.title} ({t.points} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input 
                  required 
                  placeholder="Ej. Lavar los platos" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  disabled={newTask.templateId !== "none"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción (opcional)</label>
                <Input 
                  placeholder="Detalles sobre la tarea..." 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntos</label>
                  <Input 
                    type="number" 
                    min="1" 
                    required 
                    value={newTask.points}
                    onChange={e => setNewTask({...newTask, points: parseInt(e.target.value) || 0})}
                    disabled={newTask.templateId !== "none"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asignar a</label>
                  <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({...newTask, assignedTo: v || "unassigned"})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.username || m.displayName || "Usuario"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha en calendario (Opcional)</label>
                <Input 
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              
              {newTask.templateId === "none" && !editingTaskId && (
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="saveAsTemplate"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={newTask.saveAsTemplate}
                    onChange={e => setNewTask({...newTask, saveAsTemplate: e.target.checked})}
                  />
                  <label htmlFor="saveAsTemplate" className="text-sm font-medium cursor-pointer">
                    Guardar tarea como plantilla
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full mt-4">Guardar Tarea</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Por Hacer ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="mine">Mis Tareas ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          {renderTaskList(todoTasks)}
        </TabsContent>
        <TabsContent value="mine" className="mt-0">
          {renderTaskList(myTasks)}
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          {renderTaskList(completedTasks)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
