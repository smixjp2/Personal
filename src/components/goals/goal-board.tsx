
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
  { id: "personal", title: "Personal" },
  { id: "professional", title: "Professional" },
];

export function GoalBoard() {
  const { goals, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'progress'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a goal." });
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
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new goal." });
    }
  };

  const renderColumnContent = (columnId: Goal['category']) => {
    const columnGoals = goals.filter((g) => g.category === columnId);

    if (columnId !== 'personal' || columnGoals.every(g => !g.subCategory)) {
        return (
            <div className="space-y-4">
                {columnGoals.map((goal) => (
                    <motion.div key={goal.id} layout>
                        <GoalCard goal={goal} />
                    </motion.div>
                ))}
            </div>
        );
    }

    const groupedGoals = columnGoals.reduce((acc, goal) => {
        const subCategory = goal.subCategory || 'Général';
        if (!acc[subCategory]) {
            acc[subCategory] = [];
        }
        acc[subCategory].push(goal);
        return acc;
    }, {} as Record<string, Goal[]>);

    const subCategories = Object.keys(groupedGoals).sort((a,b) => {
        if (a === 'Général') return 1;
        if (b === 'Général') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-6">
            {subCategories.map(subCategory => (
                <div key={subCategory}>
                    <h3 className="mb-3 text-md font-medium text-muted-foreground">{subCategory}</h3>
                    <div className="space-y-4">
                        {groupedGoals[subCategory].map(goal => (
                            <motion.div key={goal.id} layout>
                                <GoalCard goal={goal} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
  };


  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Goals</h1>
                <Skeleton className="h-10 w-28" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Goals</h1>
        <AddGoalDialog onAddGoal={addGoal}>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Add Goal
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
              {renderColumnContent(column.id)}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
