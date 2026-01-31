'use client';

import type { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { AddProjectDialog } from "./add-project-dialog";
import { Plus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type StatusFilter = Project['status'] | 'all';
type ChannelFilter = Project['channel'] | 'all';

const statuses: { value: StatusFilter, label: string }[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'idea', label: 'Idée' },
    { value: 'scripting', label: 'Script' },
    { value: 'recording', label: 'Tournage' },
    { value: 'editing', label: 'Montage' },
    { value: 'published', label: 'Publié' },
];

const channels: { value: ChannelFilter, label: string }[] = [
    { value: 'all', label: 'Toutes les chaînes' },
    { value: 'The Morroccan Analyst', label: 'The Morroccan Analyst' },
    { value: 'The Morroccan CFO', label: 'The Morroccan CFO' },
    { value: 'Course', label: 'Formations' },
];

export function ProjectBoard() {
  const { projects, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');

  const addProject = async (newProjectData: Omit<Project, 'id' | 'status'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }
    const id = uuidv4();
    const dataToSave: Project = {
      id,
      name: newProjectData.name,
      description: newProjectData.description,
      channel: newProjectData.channel,
      status: 'idea',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(newProjectData.dueDate && { dueDate: newProjectData.dueDate }),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "projects", id), dataToSave);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message });
    }
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .filter(p => channelFilter === 'all' || p.channel === channelFilter)
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  }, [projects, statusFilter, channelFilter]);

  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Projets</h1>
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
            </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Projets</h1>
            <p className="text-muted-foreground mt-1">Gérez vos idées de contenu et vos formations.</p>
        </div>
        <AddProjectDialog onAddProject={addProject}>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
            </Button>
        </AddProjectDialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
         <Tabs value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
            <TabsList>
                {channels.map(c => (
                    <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
                {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">Aucun projet trouvé</h3>
              <p className="text-muted-foreground mt-2">Essayez d'ajuster vos filtres ou d'ajouter un nouveau projet.</p>
          </div>
      )}
    </div>
  );
}
