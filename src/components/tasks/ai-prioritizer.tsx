"use client";

import { useState, useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import type { Task, Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskList } from "./task-list";
import { useToast } from "@/hooks/use-toast";
import { prioritizeTasks } from "@/ai/ai-task-prioritization";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, writeBatch, doc } from "firebase/firestore";

export function AiPrioritizer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const qTasks = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(qTasks, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      checkLoading();
    });

    const qGoals = query(collection(db, "goals"));
    const unsubGoals = onSnapshot(qGoals, (querySnapshot) => {
      const goalsData: Goal[] = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData);
      checkLoading();
    });

    let loadCount = 0;
    const checkLoading = () => {
        loadCount++;
        if (loadCount >= 2) {
            setIsLoading(false);
        }
    };

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, []);

  const handlePrioritize = async () => {
    setIsPrioritizing(true);
    try {
      const aiTasks = tasks.map(t => ({ name: t.title, deadline: t.dueDate }));
      const aiGoals = goals.map(g => `${g.name}: ${g.description}`);

      const result = await prioritizeTasks({ tasks: aiTasks, goals: aiGoals });
      
      const priorityMap = new Map<string, "low" | "medium" | "high">();
      result.prioritizedTasks.forEach(p => {
        priorityMap.set(p.name, p.priority);
      });

      const batch = writeBatch(db);
      tasks.forEach(task => {
        const newPriority = priorityMap.get(task.title);
        if (newPriority) {
          const taskRef = doc(db, "tasks", task.id);
          batch.update(taskRef, { priority: newPriority });
        }
      });
      await batch.commit();

      toast({
        title: "Tasks Prioritized!",
        description: "Your tasks have been re-ordered by AI.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not prioritize tasks at this time.",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const pA = a.priority ? priorityOrder[a.priority] : 4;
    const pB = b.priority ? priorityOrder[b.priority] : 4;
    return pA - pB;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrioritize} disabled={isPrioritizing || isLoading}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isPrioritizing ? "Prioritizing..." : "Prioritize with AI"}
        </Button>
      </div>
      {isLoading ? <p>Loading tasks...</p> : <TaskList tasks={sortedTasks} />}
    </div>
  );
}
