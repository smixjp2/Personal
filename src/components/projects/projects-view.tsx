
'use client';

import { useState } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectCard } from './project-card';
import { ManageProjectDialog } from './manage-project-dialog';
import Link from 'next/link';

export function ProjectsView() {
    const { projects, isInitialized } = useData();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
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
