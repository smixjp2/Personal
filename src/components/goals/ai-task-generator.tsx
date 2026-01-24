"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AITaskGeneratorProps = {
  onTasksGenerated: (tasks: string[]) => void;
};

// This is a mock AI function. In a real app, this would call a GenAI flow.
const generateTasksWithAI = async (goalName: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking time
  // In a real app, the `goalName` would be part of the prompt.
  const mockResponses: { [key: string]: string[] } = {
    default: ["Define project scope", "Create user stories", "Set up development environment", "Build initial prototype"],
  };
  return mockResponses.default;
};

export function AITaskGenerator({ onTasksGenerated }: AITaskGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would pass more context about the goal.
      const generatedTasks = await generateTasksWithAI("mock goal");
      onTasksGenerated(generatedTasks);
      toast({
        title: "AI Tasks Generated",
        description: `${generatedTasks.length} new tasks have been added to your goal.`,
      });
    } catch (error) {
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
