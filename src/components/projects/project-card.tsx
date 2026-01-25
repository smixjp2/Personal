
"use client";

import type { Project, Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { AITaskGeneratorProject } from "./ai-task-generator-project";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

export function ProjectCard({ project }: { project: Project }) {
  const { tasks } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);

  const progress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter((t) => t.completed).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, [projectTasks]);

  const onTasksGenerated = async (newTasks: string[]) => {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add tasks." });
        return;
    }
    const batch = writeBatch(firestore);
    const deadline = project.dueDate || new Date().toISOString();
    newTasks.forEach(title => {
        const newTaskId = uuidv4();
        const taskRef = doc(firestore, "users", user.uid, "tasks", newTaskId);
        const newTask: Task = {
            id: newTaskId,
            title,
            completed: false,
            dueDate: deadline,
            projectId: project.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        batch.set(taskRef, newTask);
    });

    try {
        await batch.commit();
        toast({ title: "Tâches générées par l'IA", description: `${newTasks.length} tâches ajoutées au projet.` });
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

  const updateStatus = async (status: Project['status']) => {
    if (!user || !firestore) return;
     try {
        await updateDoc(doc(firestore, "users", user.uid, "projects", project.id), { 
            status: status,
            updatedAt: new Date().toISOString() 
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update project status." });
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          {project.name}
           <Select onValueChange={updateStatus} value={project.status}>
              <SelectTrigger className="w-[140px] text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idée</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {project.dueDate && (
            <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Échéance: {new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Progression</p>
            <p className="text-sm font-bold text-primary">{progress}%</p>
          </div>
          <Progress value={progress} />
        </div>

        {projectTasks.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-sm">Tâches</h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              <AnimatePresence>
                {projectTasks.map((task) => (
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
        <AITaskGeneratorProject onTasksGenerated={onTasksGenerated} project={project} />
      </CardFooter>
    </Card>
  );
}
