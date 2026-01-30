
"use client";

import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
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
  
  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <CardTitle>{project.name}</CardTitle>
                <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>{statusTranslations[project.status]}</Badge>
            </div>
            <CardDescription className="line-clamp-2 pt-1">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end pt-4 space-y-2">
           <div className="flex items-center justify-between text-sm">
                {project.dueDate && (
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        <span>{new Date(project.dueDate).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}</span>
                    </div>
                )}
            </div>
        </CardContent>
        </Card>
    </Link>
  );
}
