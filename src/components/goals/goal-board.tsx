"use client";

import type { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { AddGoalDialog } from "./add-goal-dialog";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GoalBoard() {
  const { goals, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'progress'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification", description: "Vous devez être connecté pour ajouter un objectif." });
      return;
    }
    const newGoal: Goal = {
      ...newGoalData,
      id: uuidv4(),
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "goals", newGoal.id), newGoal);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de sauvegarder le nouvel objectif." });
    }
  };

  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Objectifs 2026</h1>
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-10 w-full max-w-sm mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full hidden lg:block" />
                </div>
            </div>
      </div>
    )
  }

  const filteredGoals = goals.filter(g => new Date(g.dueDate).getFullYear() === 2026);
  const personalGoals = filteredGoals.filter(g => g.category === 'personal');
  const professionalGoals = filteredGoals.filter(g => g.category === 'professional');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Objectifs 2026</h1>
        <AddGoalDialog onAddGoal={addGoal}>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un objectif
            </button>
        </AddGoalDialog>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
            <TabsTrigger value="personal">Personnel</TabsTrigger>
            <TabsTrigger value="professional">Professionnel</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {personalGoals.length > 0 ? personalGoals.map((goal) => (
                        <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <GoalCard goal={goal} />
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            <p>Aucun objectif personnel pour 2026.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </TabsContent>
        <TabsContent value="professional" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                        {professionalGoals.length > 0 ? professionalGoals.map((goal) => (
                        <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <GoalCard goal={goal} />
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            <p>Aucun objectif professionnel pour 2026.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
