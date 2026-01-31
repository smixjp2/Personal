'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Project } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProjectTasks } from '@/components/projects/project-tasks';
import { ProjectTools } from '@/components/projects/ProjectTools';
import { ProjectNotes } from '@/components/projects/ProjectNotes';
import { cn } from '@/lib/utils';

const statusConfig = {
  idea: { label: 'Idée', className: 'bg-blue-100 text-blue-800' },
  'pre-monetization': { label: 'En cours', className: 'bg-yellow-100 text-yellow-800' },
  monetized: { label: 'Monétisé', className: 'bg-green-100 text-green-800' },
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { data: project, isLoading } = useDoc<Project>(user ? `users/${user.uid}/projects/${projectId}` : null);
  
  const status = project ? statusConfig[project.status] : null;

  const saveProject = async (values: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    if (!user || !firestore || !id) return;
    const ref = doc(firestore, 'users', user.uid, 'projects', id);
    const dataToSave = { ...values, updatedAt: new Date().toISOString() };
    try {
        await setDoc(ref, dataToSave, { merge: true });
        toast({ title: 'Projet mis à jour !' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le projet.' });
    }
  };

  const deleteProject = async () => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'projects', projectId));
    toast({ title: 'Projet supprimé.' });
    router.push('/projects');
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!project) {
    return <div className="text-center py-10">Projet non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
        </Button>
        
        <header className="space-y-4">
             {project.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={project.imageUrl} alt={project.name} fill className="object-cover" data-ai-hint={project.imageHint} />
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    {status && <Badge variant="outline" className={cn("font-medium mb-2", status.className)}>{status.label}</Badge>}
                    <h1 className="text-4xl font-bold font-headline">{project.name}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {project.link && (
                        <Button asChild variant="outline">
                            <Link href={project.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visiter
                            </Link>
                        </Button>
                    )}
                    <ManageProjectDialog project={project} onSave={saveProject}>
                        <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                    </ManageProjectDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={deleteProject} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProjectTasks projectId={projectId} />
            <div className="space-y-6">
                <ProjectTools projectId={projectId} />
                <ProjectNotes projectId={projectId} />
            </div>
        </div>
    </div>
  )
}
