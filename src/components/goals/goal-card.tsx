
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
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { Badge } from "../ui/badge";

export function GoalCard({ goal }: { goal: Goal }) {
  const { tasks } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const goalTasks = tasks.filter(t => t.goalId === goal.id);

  useEffect(() => {
    if (!user || !firestore) return;
    
    const completedTasks = goalTasks.filter((t) => t.completed).length;
    const newProgress =
      goalTasks.length > 0
        ? Math.round((completedTasks / goalTasks.length) * 100)
        : 0;

    if (newProgress !== goal.progress) {
      const goalRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
      updateDoc(goalRef, { progress: newProgress, updatedAt: new Date().toISOString() });
    }
  }, [goalTasks, goal.id, goal.progress, user, firestore]);


  const onTasksGenerated = async (newTasks: string[]) => {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add tasks." });
        return;
    }
    const batch = writeBatch(firestore);
    newTasks.forEach(title => {
        const newTaskId = uuidv4();
        const taskRef = doc(firestore, "users", user.uid, "tasks", newTaskId);
        const newTask: Task = {
            id: newTaskId,
            title,
            completed: false,
            dueDate: goal.dueDate,
            goalId: goal.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        batch.set(taskRef, newTask);
    });

    try {
        await batch.commit();
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save generated tasks." });
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user || !firestore) return;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), { 
            completed: !task.completed,
            updatedAt: new Date().toISOString() 
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update task." });
    }
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Due by {new Date(goal.dueDate).toLocaleDateString()}</span>
          </div>
          {goal.subCategory && (
            <Badge variant="outline" className="font-normal">{goal.subCategory}</Badge>
          )}
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
                      onCheckedChange={() => toggleTask(task)}
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
