'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectCard } from './project-card';
import { ManageProjectDialog } from './manage-project-dialog';
import Link from 'next/link';

const defaultProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        name: 'The Moroccan Analyst',
        description: 'Chaîne YouTube sur l\'analyse financière et la bourse au Maroc. Déjà monétisée.',
        link: 'https://www.youtube.com/@The_Moroccan_Analyst',
        status: 'monetized',
        imageUrl: PlaceHolderImages.find(p => p.id === 'project-analyst')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'project-analyst')?.imageHint,
    },
    {
        name: 'The Moroccan CFO',
        description: 'Chaîne YouTube axée sur la finance d\'entreprise. Pas encore monétisée.',
        link: 'https://www.youtube.com/@TheMoroccanCFO',
        status: 'pre-monetization',
        imageUrl: PlaceHolderImages.find(p => p.id === 'project-cfo')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'project-cfo')?.imageHint,
    }
];

export function ProjectsView() {
    const { projects, isInitialized } = useData();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    useEffect(() => {
        if (isInitialized && user && firestore && projects.length === 0) {
            const batch = writeBatch(firestore);
            defaultProjects.forEach(project => {
                const projectId = uuidv4();
                const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
                batch.set(projectRef, {
                    ...project,
                    id: projectId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            });
            batch.commit().catch(error => {
                console.error("Failed to seed projects:", error);
                toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'initialiser les projets.' });
            });
        }
    }, [isInitialized, user, firestore, projects, toast]);
    
    const saveProject = async (values: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, projectId?: string) => {
        if (!user || !firestore) return;
        const id = projectId || uuidv4();
        const ref = doc(firestore, 'users', user.uid, 'projects', id);
        
        const dataToSave = {
            ...values,
            updatedAt: new Date().toISOString(),
            ...( !projectId && { createdAt: new Date().toISOString(), id: id } )
        };

        try {
            await setDoc(ref, dataToSave, { merge: true });
            toast({ title: projectId ? 'Projet mis à jour !' : 'Projet ajouté !' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le projet.' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-headline">Mes Projets</h1>
                    <p className="text-lg text-muted-foreground">
                        Suivez l'avancement de vos projets et entreprises parallèles.
                    </p>
                </div>
                <ManageProjectDialog onSave={saveProject}>
                    <Button><Plus className="mr-2 h-4 w-4" />Nouveau Projet</Button>
                </ManageProjectDialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isInitialized ? (
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
                ) : projects.length > 0 ? (
                    <AnimatePresence>
                        {projects.sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()).map(project => (
                            <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                <Link href={`/projects/${project.id}`} className="h-full flex">
                                    <ProjectCard project={project} />
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>Aucun projet pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
