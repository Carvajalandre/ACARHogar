"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tareas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y asigna las tareas del hogar
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Empty state */}
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-primary/10 p-5 mb-5">
            <ClipboardList className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Sin tareas aún</h2>
          <p className="max-w-sm text-center text-sm text-muted-foreground mb-6">
            Crea tu primer hogar y empieza a agregar tareas para que todos los
            miembros sepan qué hacer.
          </p>
          <Button variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear primera tarea
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
