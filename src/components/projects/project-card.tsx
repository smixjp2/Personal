"use client";

import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Clock, CheckCircle, Film, Lightbulb, Pen, Scissors } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

const statusConfig: Record<Project['status'], { label: string; icon: React.ElementType, color: string }> = {
    idea: { label: "Idée", icon: Lightbulb, color: "bg-yellow-500" },
    scripting: { label: "Script", icon: Pen, color: "bg-blue-500" },
    recording: { label: "Tournage", icon: Film, color: "bg-orange-500" },
    editing: { label: "Montage", icon: Scissors, color: "bg-purple-500" },
    published: { label: "Publié", icon: CheckCircle, color: "bg-green-500" },
};

export function ProjectCard({ project }: { project: Project }) {
  const statusInfo = statusConfig[project.status];
  const imageUrl = `https://picsum.photos/seed/${project.id}/600/400`;

  return (
    <Link href={`/projects/${project.id}`} className="block h-full group">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative h-40 w-full overflow-hidden">
            <Image
                src={imageUrl}
                alt={project.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="project abstract"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge variant="secondary" className="absolute top-3 left-3">{project.channel === 'Course' ? 'Formation' : project.channel}</Badge>
        </div>
        <CardHeader className="flex-1">
            <CardTitle className="text-xl leading-tight">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2 pt-2 text-sm">{project.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
             <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", statusInfo.color)} />
                <span className="font-medium">{statusInfo.label}</span>
            </div>
            {project.dueDate && (
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(project.dueDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</span>
                </div>
            )}
        </CardFooter>
      </Card>
    </Link>
  );
}
