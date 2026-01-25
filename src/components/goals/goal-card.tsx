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
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function GoalCard({ goal }: { goal: Goal }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState(goal.progress);
  const { toast } = useToast();

  useEffect(() => {
    if (!goal.id || !db) return;
    const q = query(collection(db, "tasks"), where("goalId", "==", goal.id));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);

      // Recalculate progress
      const completedTasks = tasksData.filter((t) => t.completed).length;
      const newProgress =
        tasksData.length > 0
          ? Math.round((completedTasks / tasksData.length) * 100)
          : 0;
      
      // Update goal progress in Firestore if it has changed
      if (db && newProgress !== progress) {
        setProgress(newProgress);
        const goalRef = doc(db, "goals", goal.id);
        await updateDoc(goalRef, { progress: newProgress });
      } else if (db && tasksData.length === 0 && progress !== 0) {
        setProgress(0);
        const goalRef = doc(db, "goals", goal.id);
        await updateDoc(goalRef, { progress: 0 });
      }
    });

    return () => unsubscribe();
  }, [goal.id, goal.progress, progress]);

  const onTasksGenerated = async (newTasks: string[]) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    const batch = writeBatch(db);
    newTasks.forEach((title) => {
      const newTaskRef = doc(collection(db, "tasks"));
      batch.set(newTaskRef, {
        title,
        completed: false,
        dueDate: goal.dueDate,
        goalId: goal.id,
      });
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error generating tasks: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible de générer les tâches. Veuillez réessayer.",
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!db) {
       toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    const taskRef = doc(db, "tasks", taskId);
    const taskToToggle = tasks.find((t) => t.id === taskId);
    if (taskToToggle) {
      try {
        await updateDoc(taskRef, { completed: !taskToToggle.completed });
      } catch (error) {
        console.error("Error toggling task: ", error);
        toast({
          variant: "destructive",
          title: "Oh non ! Quelque chose s'est mal passé.",
          description: "Impossible de mettre à jour la tâche. Veuillez réessayer.",
        });
      }
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
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Due by {new Date(goal.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-sm font-bold text-primary">{progress}%</p>
          </div>
          <Progress value={progress} />
        </div>

        {tasks.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-sm">Tasks</h4>
            <ul className="space-y-2">
              <AnimatePresence>
                {tasks.map((task) => (
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
