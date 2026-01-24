"use client";

import type { Goal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle } from "lucide-react";
import { AITaskGenerator } from "./ai-task-generator";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";

export function GoalCard({ goal: initialGoal }: { goal: Goal }) {
  const [goal, setGoal] = useState(initialGoal);

  const onTasksGenerated = (newTasks: string[]) => {
    const newTaskList = newTasks.map((title, index) => ({
        id: `task-${goal.id}-${Date.now()}-${index}`,
        title,
        completed: false,
        dueDate: goal.dueDate
    }));
    setGoal(g => ({...g, tasks: [...g.tasks, ...newTaskList]}));
  };

  const toggleTask = (taskId: string) => {
    const newTasks = goal.tasks.map(t => t.id === taskId ? {...t, completed: !t.completed} : t);
    const completedTasks = newTasks.filter(t => t.completed).length;
    const newProgress = newTasks.length > 0 ? Math.round((completedTasks / newTasks.length) * 100) : 0;
    setGoal({...goal, tasks: newTasks, progress: newProgress });
  }

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
        
        {goal.tasks.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-sm">Tasks</h4>
            <ul className="space-y-2">
                <AnimatePresence>
              {goal.tasks.map((task) => (
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
                    className={`flex-grow cursor-pointer ${task.completed ? 'text-muted-foreground line-through' : ''}`}
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
