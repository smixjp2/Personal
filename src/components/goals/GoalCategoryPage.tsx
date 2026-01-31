
"use client";

import type { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { AddGoalDialog } from "./add-goal-dialog";
import { Plus, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type GoalCategoryPageProps = {
    category: 'personal' | 'professional';
    categoryName: string;
    description?: string;
}

export function GoalCategoryPage({ category, categoryName, description }: GoalCategoryPageProps) {
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

  const editGoal = async (goalId: string, updatedData: Partial<Omit<Goal, 'id'>>) => {
    if (!user || !firestore) return;
    try {
      await updateDoc(doc(firestore, "users", user.uid, "goals", goalId), {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de modifier l'objectif." });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, "users", user.uid, "goals", goalId));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de supprimer l'objectif." });
    }
  };

  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full hidden lg:block" />
            </div>
      </div>
    )
  }

  const filteredGoals = goals.filter(g => g.category === category && new Date(g.dueDate).getFullYear() === 2026);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/goals">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold font-headline">Objectifs {categoryName} 2026</h1>
        </div>
        <AddGoalDialog onAddGoal={addGoal} defaultCategory={category}>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un objectif
            </button>
        </AddGoalDialog>
      </div>

      {description && <p className="text-lg text-muted-foreground">{description}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <AnimatePresence>
            {filteredGoals.length > 0 ? filteredGoals.map((goal) => (
                <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <GoalCard 
                        goal={goal}
                        onEdit={(updatedData) => editGoal(goal.id, updatedData)}
                        onDelete={() => deleteGoal(goal.id)}
                    />
                </motion.div>
            )) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>Aucun objectif {categoryName.toLowerCase()} pour 2026.</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
