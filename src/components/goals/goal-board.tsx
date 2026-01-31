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

const columns: {
  id: Goal["category"];
  title: string;
}[] = [
  { id: "personal", title: "Personnel" },
  { id: "professional", title: "Professionnel" },
];

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {columns.map(column => (
                    <div key={column.id} className="rounded-xl bg-card/50 p-4">
                        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                            {column.title}
                        </h2>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </div>
                ))}
            </div>
      </div>
    )
  }

  const filteredGoals = goals.filter(g => new Date(g.dueDate).getFullYear() === 2026);


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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatePresence>
          {columns.map((column) => (
            <div key={column.id} className="rounded-xl bg-card/50 p-4">
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                {column.title}
              </h2>
               <div className="space-y-4">
                {filteredGoals.filter(g => g.category === column.id).map((goal) => (
                    <motion.div key={goal.id} layout>
                        <GoalCard goal={goal} />
                    </motion.div>
                ))}
                {filteredGoals.filter(g => g.category === column.id).length === 0 && (
                    <p className="text-muted-foreground text-center py-8">Aucun objectif {column.id === 'personal' ? 'personnel' : 'professionnel'} pour 2026.</p>
                )}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
