
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
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const statusTranslations: Record<Project['status'], string> = {
    idea: "Idée",
    scripting: "Script",
    recording: "Tournage",
    editing: "Montage",
    published: "Publié"
}

export function ProjectCard({ project }: { project: Project }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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
                    {Object.entries(statusTranslations).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-4 space-y-2">
           <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{project.channel}</Badge>
                {project.dueDate && (
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}
