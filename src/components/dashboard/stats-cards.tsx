"use client";

import { CheckSquare, ListTodo, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Habit, Goal, Task } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function StatsCards() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubHabits = onSnapshot(collection(db, "habits"), (snap) => {
      setHabits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
      checkLoading();
    });
    const unsubGoals = onSnapshot(collection(db, "goals"), (snap) => {
      setGoals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
      checkLoading();
    });
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
        collection(db, "tasks"), 
        where("dueDate", ">=", today.toISOString().split('T')[0]),
        where("dueDate", "<", tomorrow.toISOString().split('T')[0])
    );
    const unsubTasks = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      checkLoading();
    });

    let loadCount = 0;
    const checkLoading = () => {
        loadCount++;
        if (loadCount >= 3) {
            setIsLoading(false);
        }
    };

    return () => {
      unsubHabits();
      unsubGoals();
      unsubTasks();
    };
  }, []);
  
  if (isLoading) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[125px]" />
            <Skeleton className="h-[125px]" />
            <Skeleton className="h-[125px]" />
        </div>
    )
  }

  const dailyHabitsCompleted = habits.filter(h => h.frequency === 'daily' && h.progress === 1).length;
  const dailyHabitsTotal = habits.filter(h => h.frequency === 'daily').length;
  const goalsInProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
  const tasksDueToday = tasks.filter(t => !t.completed).length;

  const stats = [
    {
      title: "Daily Habits",
      value: `${dailyHabitsCompleted}/${dailyHabitsTotal}`,
      icon: CheckSquare,
      description: "Completed today",
    },
    {
      title: "Goals in Progress",
      value: goalsInProgress,
      icon: Target,
      description: "Actively working on",
    },
    {
      title: "Tasks for Today",
      value: tasksDueToday,
      icon: ListTodo,
      description: "Remaining on your list",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
