"use client";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Plus, Trophy, Flame, Trash2, Edit2 } from "lucide-react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Reward, RewardType, Redemption, createReward, deleteReward, updateReward, createRedemption } from "@/lib/firebase/rewards";
import { updateUserPoints } from "@/lib/firebase/users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function RewardsPage() {
  const { user, householdId, username } = useRequireAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{ title: string; description?: string; cost: number; type: RewardType }>({
    title: "",
    description: "",
    cost: 50,
    type: "reward"
  });

  useEffect(() => {
    if (!user || !householdId) {
      setLoading(false);
      return;
    }

    // Listen to user points
    const userUnsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserPoints(docSnap.data().points || 0);
      }
    });

    // Listen to household rewards
    const q = query(collection(db, "rewards"), where("householdId", "==", householdId));
    const rewardsUnsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
      fetched.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setRewards(fetched);
      setLoading(false);
    });

    // Listen to household redemptions
    const redemptionsQuery = query(collection(db, "redemptions"), where("householdId", "==", householdId));
    const redemptionsUnsub = onSnapshot(redemptionsQuery, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redemption));
      fetched.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setRedemptions(fetched);
    });

    return () => {
      userUnsub();
      rewardsUnsub();
      redemptionsUnsub();
    };
  }, [user, householdId]);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !householdId || !newItem.title.trim()) return;

    if (editingItemId) {
      await updateReward(editingItemId, {
        title: newItem.title,
        description: newItem.description?.trim() || undefined,
        cost: Number(newItem.cost) || 0,
        type: newItem.type,
      });
    } else {
      await createReward({
        title: newItem.title,
        description: newItem.description?.trim() || undefined,
        cost: Number(newItem.cost) || 0,
        type: newItem.type,
        householdId: householdId,
        createdBy: user.uid,
      });
    }

    setIsDialogOpen(false);
    setEditingItemId(null);
    setNewItem({ title: "", description: "", cost: 50, type: "reward" });
  };

  const handleDelete = async (rewardId: string) => {
    if (confirm("¿Estás seguro de eliminar este ítem?")) {
      await deleteReward(rewardId);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user || !householdId) return;
    if (reward.type === "reward") {
      if (userPoints < reward.cost) {
        alert("No tienes suficientes puntos para canjear esta recompensa.");
        return;
      }
      if (confirm(`¿Quieres canjear "${reward.title}" por ${reward.cost} puntos?`)) {
        await updateUserPoints(user.uid, -reward.cost);
        await createRedemption({
          rewardId: reward.id!,
          rewardTitle: reward.title,
          rewardType: reward.type,
          cost: reward.cost,
          userId: user.uid,
          userName: username || user.displayName || user.email || "Miembro del Hogar",
          householdId: householdId,
        });
        alert("¡Recompensa canjeada con éxito!");
      }
    } else {
      if (confirm(`¿Quieres aplicar el castigo "${reward.title}" (Penalización: ${reward.cost} puntos)?`)) {
        await updateUserPoints(user.uid, -reward.cost);
        await createRedemption({
          rewardId: reward.id!,
          rewardTitle: reward.title,
          rewardType: reward.type,
          cost: reward.cost,
          userId: user.uid,
          userName: username || user.displayName || user.email || "Miembro del Hogar",
          householdId: householdId,
        });
        alert("¡Castigo aplicado!");
      }
    }
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
              <Gift className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No perteneces a ningún hogar</h2>
            <p className="max-w-sm text-center text-sm text-muted-foreground mb-6">
              Debes crear un hogar o unirte a uno existente para poder gestionar recompensas.
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">Ir al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rewardList = rewards.filter(r => r.type === "reward");
  const punishmentList = rewards.filter(r => r.type === "punishment");

  const renderList = (items: Reward[], type: RewardType) => {
    if (items.length === 0) {
      return (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className={`rounded-2xl p-5 mb-5 ${type === 'reward' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {type === 'reward' ? (
                <Gift className="h-10 w-10 text-primary" />
              ) : (
                <Flame className="h-10 w-10 text-destructive" />
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {type === 'reward' ? "Sin recompensas aún" : "Sin castigos aún"}
            </h2>
            <p className="max-w-sm text-center text-sm text-muted-foreground mb-6">
              {type === 'reward' 
                ? "Define recompensas que los miembros del hogar puedan canjear con puntos."
                : "Añade penitencias para los que incumplan sus responsabilidades."}
            </p>
            <Button variant="secondary" className="gap-2" onClick={() => {
              setNewItem({ ...newItem, type });
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4" />
              Crear {type === 'reward' ? 'Recompensa' : 'Castigo'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="transition-all hover:bg-muted/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`flex-shrink-0 p-3 rounded-xl ${item.type === 'reward' ? 'bg-amber-500/10' : 'bg-destructive/10'}`}>
                {item.type === 'reward' ? (
                  <Gift className="h-5 w-5 text-amber-500" />
                ) : (
                  <Flame className="h-5 w-5 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                    item.type === 'reward' 
                      ? 'text-amber-500 bg-amber-500/10' 
                      : 'text-destructive bg-destructive/10'
                  }`}>
                    {item.type === 'reward' ? 'Costo:' : 'Penalización:'} {item.cost} pts
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant={item.type === "reward" ? (userPoints >= item.cost ? "default" : "secondary") : "destructive"}
                  disabled={item.type === "reward" && userPoints < item.cost}
                  onClick={() => handleRedeem(item)}
                >
                  {item.type === "reward" ? "Canjear" : "Aplicar"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" 
                  onClick={() => {
                    setEditingItemId(item.id!);
                    setNewItem({ title: item.title, description: item.description || "", cost: item.cost, type: item.type });
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => handleDelete(item.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRedemptionsList = (items: Redemption[]) => {
    if (items.length === 0) {
      return (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl p-5 mb-5 bg-muted">
              <Gift className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Sin canjes aún</h2>
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Aquí verás el historial de recompensas canjeadas y castigos aplicados por los miembros del hogar.
            </p>
          </CardContent>
        </Card>
      );
    }

    const formatEventDate = (timestamp: any) => {
      if (!timestamp) return "";
      const date = timestamp.toDate?.() || new Date(timestamp);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    return (
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="transition-all hover:bg-muted/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`flex-shrink-0 p-3 rounded-xl ${item.rewardType === 'reward' ? 'bg-amber-500/10' : 'bg-destructive/10'}`}>
                  {item.rewardType === 'reward' ? (
                    <Gift className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Flame className="h-5 w-5 text-destructive" />
                  )}
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {item.rewardTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {item.rewardType === 'reward' ? 'Canjeado por' : 'Aplicado a'}{' '}
                    <span className="font-medium text-foreground">{item.userName}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`font-semibold text-sm px-2 py-0.5 rounded-full ${
                  item.rewardType === 'reward' 
                    ? 'text-amber-500 bg-amber-500/10' 
                    : 'text-destructive bg-destructive/10'
                }`}>
                  -{item.cost} pts
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatEventDate(item.createdAt)}
                </span>
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
          <h1 className="text-2xl font-bold">Recompensas y Castigos</h1>
          <p className="text-sm text-muted-foreground">
            Motiva el cumplimiento de las tareas del hogar
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingItemId(null);
            setNewItem({ title: "", description: "", cost: 50, type: "reward" });
          }
        }}>
          <DialogTrigger 
            render={
              <Button className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Nuevo Ítem
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItemId ? "Editar Ítem" : "Crear Recompensa o Castigo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={newItem.type} onValueChange={(v) => v && setNewItem({...newItem, type: v as RewardType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reward">Recompensa (Premio)</SelectItem>
                    <SelectItem value="punishment">Castigo (Penitencia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input 
                  required 
                  placeholder={newItem.type === 'reward' ? "Ej. Pedir Delivery" : "Ej. Limpiar los vidrios"} 
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción (Opcional)</label>
                <Input 
                  placeholder="Detalles adicionales..." 
                  value={newItem.description || ""}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {newItem.type === "reward" ? "Costo en Puntos" : "Penalización en Puntos"}
                </label>
                <Input 
                  type="number" 
                  min="1" 
                  required 
                  value={newItem.cost}
                  onChange={e => setNewItem({...newItem, cost: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <Button type="submit" className="w-full mt-4">Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Points summary */}
      <Card className="mb-6 border-border bg-gradient-to-r from-primary/10 to-transparent">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-xl bg-amber-500/15 p-3">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Tus puntos disponibles</p>
            <p className="text-3xl font-bold text-foreground">{userPoints}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rewards">Recompensas ({rewardList.length})</TabsTrigger>
          <TabsTrigger value="punishments">Castigos ({punishmentList.length})</TabsTrigger>
          <TabsTrigger value="redemptions">Canjeados ({redemptions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="rewards" className="mt-0">
          {renderList(rewardList, "reward")}
        </TabsContent>
        <TabsContent value="punishments" className="mt-0">
          {renderList(punishmentList, "punishment")}
        </TabsContent>
        <TabsContent value="redemptions" className="mt-0">
          {renderRedemptionsList(redemptions)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
