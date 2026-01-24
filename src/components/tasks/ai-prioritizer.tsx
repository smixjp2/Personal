"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskList } from "./task-list";
import { useToast } from "@/hooks/use-toast";
import { prioritizeTasks } from "@/ai/ai-task-prioritization";
import { goals } from "@/lib/placeholder-data";

export function AiPrioritizer({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePrioritize = async () => {
    setIsLoading(true);
    try {
      const aiTasks = tasks.map(t => ({ name: t.title, deadline: t.dueDate }));
      const aiGoals = goals.map(g => `${g.name}: ${g.description}`);

      const result = await prioritizeTasks({ tasks: aiTasks, goals: aiGoals });
      
      const priorityMap = new Map<string, "low" | "medium" | "high">();
      result.prioritizedTasks.forEach(p => {
        priorityMap.set(p.name, p.priority);
      });

      const updatedTasks = tasks.map(task => ({
        ...task,
        priority: priorityMap.get(task.title) || task.priority,
      }));

      const priorityOrder = { high: 1, medium: 2, low: 3 };
      updatedTasks.sort((a, b) => {
        const pA = a.priority ? priorityOrder[a.priority] : 4;
        const pB = b.priority ? priorityOrder[b.priority] : 4;
        return pA - pB;
      });

      setTasks(updatedTasks);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrioritize} disabled={isLoading}>
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading ? "Prioritizing..." : "Prioritize with AI"}
        </Button>
      </div>
      <TaskList tasks={tasks} />
    </div>
  );
}
