"use client";

import type { Goal, Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { AITaskGenerator } from "./ai-task-generator";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";

export function GoalCard({ goal }: { goal: Goal }) {
  const { tasks, setTasks, setGoals } = useData();
  const { toast } = useToast();

  const goalTasks = tasks.filter(t => t.goalId === goal.id);

  useEffect(() => {
    const completedTasks = goalTasks.filter((t) => t.completed).length;
    const newProgress =
      goalTasks.length > 0
        ? Math.round((completedTasks / goalTasks.length) * 100)
        : 0;

    if (newProgress !== goal.progress) {
      setGoals(prevGoals =>
        prevGoals.map(g =>
          g.id === goal.id ? { ...g, progress: newProgress } : g
        )
      );
    }
  }, [goalTasks, goal.id, goal.progress, setGoals]);


  const onTasksGenerated = (newTasks: string[]) => {
    const tasksToAdd: Task[] = newTasks.map(title => ({
      id: uuidv4(),
      title,
      completed: false,
      dueDate: goal.dueDate,
      goalId: goal.id,
    }));

    setTasks(prev => [...prev, ...tasksToAdd]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          {goal.name}
        </CardTitle>
        <CardDescription>{goal.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Due by {new Date(goal.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-sm font-bold text-primary">{goal.progress}%</p>
          </div>
          <Progress value={goal.progress} />
        </div>

        {goalTasks.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-sm">Tasks</h4>
            <ul className="space-y-2">
              <AnimatePresence>
                {goalTasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-grow cursor-pointer ${
                        task.completed ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {task.title}
                    </label>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <AITaskGenerator onTasksGenerated={onTasksGenerated} goal={goal} />
      </CardFooter>
    </Card>
  );
}
