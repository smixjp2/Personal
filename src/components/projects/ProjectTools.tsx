'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import type { ProjectTool } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, ExternalLink, Edit } from 'lucide-react';
import { ManageToolDialog } from './ManageToolDialog';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export function ProjectTools({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const toolsPath = user ? `users/${user.uid}/projects/${projectId}/tools` : null;
  const { data: tools, isLoading } = useCollection<ProjectTool>(toolsPath);

  const deleteTool = async (toolId: string) => {
    if (!user || !firestore || !toolsPath) return;
    try {
      await deleteDoc(doc(firestore, toolsPath, toolId));
      toast({ title: 'Outil supprimé.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'outil.' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Outils de Création</CardTitle>
            <CardDescription>Centralisez les liens vers Canva, YouTube Studio, etc.</CardDescription>
        </div>
        <ManageToolDialog projectId={projectId}>
            <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
        </ManageToolDialog>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
            {isLoading && (
                <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </>
            )}
            {!isLoading && tools && tools.length > 0 ? (
                tools.map((tool) => (
                    <li key={tool.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                        <Button variant="link" asChild className="p-0 h-auto justify-start">
                            <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {tool.name}
                            </Link>
                        </Button>
                        <div className="flex items-center">
                            <ManageToolDialog projectId={projectId} tool={tool}>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                            </ManageToolDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteTool(tool.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </li>
                ))
            ) : !isLoading && (
                <p className="text-center text-muted-foreground py-6">Aucun outil ajouté.</p>
            )}
        </ul>
      </CardContent>
    </Card>
  );
}
