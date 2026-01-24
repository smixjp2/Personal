"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTasks } from "@/ai/ai-task-generation";
import type { Goal } from "@/lib/types";

type AITaskGeneratorProps = {
  goal: Goal;
  onTasksGenerated: (tasks: string[]) => void;
};

export function AITaskGenerator({ goal, onTasksGenerated }: AITaskGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    try {
      const result = await generateTasks({
        projectDescription: `${goal.name}: ${goal.description}`,
        projectType: goal.category,
        desiredNumberOfTasks: 5,
      });

      const generatedTasks = result.tasks;

      onTasksGenerated(generatedTasks);
      toast({
        title: "AI Tasks Generated",
        description: `${generatedTasks.length} new tasks have been added to your goal.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate tasks at this time.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerateTasks} disabled={isLoading} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
      {isLoading ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Generating tasks...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Tasks with AI
        </>
      )}
    </Button>
  );
}
