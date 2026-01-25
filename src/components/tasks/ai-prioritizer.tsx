"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskList } from "./task-list";
import { useToast } from "@/hooks/use-toast";
import { prioritizeTasks } from "@/ai/ai-task-prioritization";
import { useData } from "@/contexts/data-context";

export function AiPrioritizer() {
  const { tasks, setTasks, goals, isInitialized } = useData();
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();

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

      setTasks(prevTasks =>
        prevTasks.map(task => ({
          ...task,
          priority: priorityMap.get(task.title) || task.priority,
        }))
      );

      toast({
        title: "Tâches priorisées !",
        description: "Vos tâches ont été réorganisées par l'IA.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur IA",
        description: "Impossible de prioriser les tâches pour le moment.",
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
        <Button onClick={handlePrioritize} disabled={isPrioritizing || !isInitialized}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isPrioritizing ? "Prioritisation..." : "Prioriser avec l'IA"}
        </Button>
      </div>
      {!isInitialized ? <p>Loading tasks...</p> : <TaskList tasks={sortedTasks} />}
    </div>
  );
}
