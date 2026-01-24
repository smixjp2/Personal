"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskList } from "./task-list";
import { useToast } from "@/hooks/use-toast";

const prioritizeWithAI = async (tasks: Task[]): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock AI logic: shuffle tasks and assign random priorities
  const priorities: Array<Task['priority']> = ["high", "medium", "low"];
  const prioritized = [...tasks]
    .sort(() => Math.random() - 0.5)
    .map(task => ({
      ...task,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    }));
  
  return prioritized;
};

export function AiPrioritizer({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePrioritize = async () => {
    setIsLoading(true);
    try {
      const prioritizedTasks = await prioritizeWithAI(tasks);
      setTasks(prioritizedTasks);
      toast({
        title: "Tasks Prioritized!",
        description: "Your tasks have been re-ordered by AI.",
      });
    } catch (error) {
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
