"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Plus, Trophy } from "lucide-react";

export default function RewardsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recompensas</h1>
          <p className="text-sm text-muted-foreground">
            Canjea tus puntos por recompensas del hogar
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Recompensa
        </Button>
      </div>

      {/* Points summary */}
      <Card className="mb-6 border-border bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-xl bg-amber-500/15 p-3">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tus puntos</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      <Card className="border-dashed border-border bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-primary/10 p-5 mb-5">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Sin recompensas aún</h2>
          <p className="max-w-sm text-center text-sm text-muted-foreground mb-6">
            Define recompensas que los miembros del hogar puedan canjear con los
            puntos que ganan al completar tareas.
          </p>
          <Button variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear primera recompensa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
