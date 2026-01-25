"use client";

import type { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { AddGoalDialog } from "./add-goal-dialog";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';

const columns: {
  id: Goal["category"];
  title: string;
}[] = [
  { id: "professional", title: "Professional" },
  { id: "personal", title: "Personal" },
  { id: "course", title: "Courses" },
];

export function GoalBoard() {
  const { goals, setGoals, isInitialized } = useData();

  const addGoal = (newGoalData: Omit<Goal, 'id' | 'progress'>) => {
    const newGoal: Goal = {
      ...newGoalData,
      id: uuidv4(),
      progress: 0,
    };
    setGoals(prev => [...prev, newGoal]);
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {columns.map((column) => (
            <div key={column.id} className="rounded-xl bg-card/50 p-4">
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                {column.title}
              </h2>
              <div className="space-y-4">
                {goals
                  .filter((g) => g.category === column.id)
                  .map((goal) => (
                    <motion.div key={goal.id} layout>
                        <GoalCard goal={goal} />
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
