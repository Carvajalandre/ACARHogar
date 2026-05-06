"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
            <p className="text-sm text-muted-foreground">
              No hay tareas programadas para este día.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
