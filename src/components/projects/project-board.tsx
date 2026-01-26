
"use client";

import type { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { AddProjectDialog } from "./add-project-dialog";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";

const columns: {
  id: Project["status"];
  title: string;
}[] = [
  { id: "idea", title: "Idées Brutes" },
  { id: "in-progress", title: "En Cours" },
  { id: "completed", title: "Terminé" },
];

export function ProjectBoard() {
  const { projects, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addProject = async (newProjectData: Omit<Project, 'id' | 'status'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a project." });
      return;
    }
    const id = uuidv4();
    const dataToSave = {
      id,
      name: newProjectData.name,
      description: newProjectData.description,
      status: 'idea' as Project['status'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(newProjectData.dueDate && { dueDate: newProjectData.dueDate }),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "projects", id), dataToSave);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new project." });
    }
  };

  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Projets</h1>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {columns.map(column => (
                    <div key={column.id} className="rounded-xl bg-card/50 p-4">
                        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                            {column.title}
                        </h2>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </div>
                ))}
            </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Projets</h1>
        <AddProjectDialog onAddProject={addProject}>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Ajouter un Projet
            </button>
        </AddProjectDialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {columns.map((column) => (
            <div key={column.id} className="rounded-xl bg-card/50 p-4">
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                {column.title}
              </h2>
              <div className="space-y-4">
                {projects
                  .filter((p) => p.status === column.id)
                  .map((project) => (
                    <motion.div key={project.id} layout>
                        <ProjectCard project={project} />
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
