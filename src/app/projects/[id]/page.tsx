'use client';

import { useData } from '@/contexts/data-context';
import { useParams } from 'next/navigation';
import { ProjectDetail } from '@/components/projects/project-detail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProjectPage() {
  const { id } = useParams();
  const { projects, isInitialized } = useData();

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
        </Link>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
         <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">Projet non trouvé</h1>
            <p>Le projet que vous cherchez n'existe pas ou a été supprimé.</p>
            <Button asChild>
                <Link href="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste des projets
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-4">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
        </Link>
        <ProjectDetail project={project} />
    </div>
  );
}
