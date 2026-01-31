"use client";

import type { Project } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { ManageProjectDialog } from "./manage-project-dialog";
import { cn } from "@/lib/utils";

const statusConfig = {
  idea: { label: 'Idée', className: 'bg-blue-100 text-blue-800' },
  'pre-monetization': { label: 'En cours', className: 'bg-yellow-100 text-yellow-800' },
  monetized: { label: 'Monétisé', className: 'bg-green-100 text-green-800' },
};

type ProjectCardProps = {
  project: Project;
  onEdit: (values: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, projectId: string) => void;
  onDelete: (projectId: string) => void;
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <ManageProjectDialog project={project} onSave={onEdit}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                        </DropdownMenuItem>
                    </ManageProjectDialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Supprimer</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action est irréversible. Le projet "{project.name}" sera définitivement supprimé.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(project.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="outline" className={cn("font-medium", status.className)}>{status.label}</Badge>
      </CardContent>
      <CardFooter>
        {project.link && (
            <Button asChild variant="outline" className="w-full">
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
