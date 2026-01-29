"use client";

import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/data-context";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";

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
    <Link href={`/projects/${project.id}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
        <CardHeader>
            <CardTitle className="flex justify-between items-start">
            <span className="pr-4">{project.name}</span>
            <Select onValueChange={updateStatus} value={project.status}>
                <SelectTrigger className="w-[140px] text-xs h-8" onClick={(e) => e.preventDefault()}>
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="idea">Idée</SelectItem>
                    <SelectItem value="in-progress">En cours</SelectItem>
                </SelectContent>
                </Select>
            </CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
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
        </CardContent>
        </Card>
    </Link>
  );
}
