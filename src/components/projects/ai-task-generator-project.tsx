
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTasks } from "@/ai/ai-task-generation";
import type { Project } from "@/lib/types";

type AITaskGeneratorProjectProps = {
  project: Project;
  onTasksGenerated: (tasks: string[]) => void;
};

export function AITaskGeneratorProject({ project, onTasksGenerated }: AITaskGeneratorProjectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    try {
      const result = await generateTasks({
        projectDescription: `Project Name: ${project.name}\nProject Description: ${project.description}`,
        projectType: 'professional', // Projects are generically professional for task generation purposes
        desiredNumberOfTasks: 5,
      });

      const generatedTasks = result.tasks;

      onTasksGenerated(generatedTasks);

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
          Génération des tâches...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Générer les tâches avec l'IA
        </>
      )}
    </Button>
  );
}
