"use client";

import type { Project } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  idea: { label: 'Idée', className: 'bg-blue-100 text-blue-800' },
  'pre-monetization': { label: 'En cours', className: 'bg-yellow-100 text-yellow-800' },
  monetized: { label: 'Monétisé', className: 'bg-green-100 text-green-800' },
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden transition-all hover:shadow-lg">
      {project.imageUrl && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={project.imageUrl}
            alt={project.name}
            fill
            className="object-cover"
            data-ai-hint={project.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{project.name}</CardTitle>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="outline" className={cn("font-medium", status.className)}>{status.label}</Badge>
      </CardContent>
      <CardFooter>
        {project.link && (
            <Button asChild variant="outline" className="w-full" onClick={e => e.stopPropagation()}>
                <Link href={project.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visiter le projet
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
