
'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Note, ReflectionPillar } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, Trash2, BrainCircuit, MoreHorizontal, Pencil, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ManagePillarDialog } from './manage-pillar-dialog';

const defaultPillars = [
    { title: 'Mes projections dans le futur', description: "Où vous voyez-vous dans 1, 5, 10 ans ? Quels sont vos grands rêves ?" },
    { title: 'Liste des compliments', description: "Notez les compliments que les gens vous font. C'est une source de confiance et de prise de conscience de vos forces." },
    { title: 'Ma valeur sur le marché', description: "Combien valez-vous professionnellement ? Quelles compétences sont les plus demandées ?" },
    { title: 'Autres moyens d\'investissement', description: "Explorez de nouvelles avenues pour faire fructifier votre capital au-delà des options actuelles." },
    { title: 'Intégrer la bourse USA', description: "Quelles sont les étapes, les plateformes et les stratégies pour investir sur le marché américain ?" },
    { title: 'Retraites complémentaires', description: "Quelles options de retraite existent pour compléter le système de base ?" },
];

export function NotesView() {
  const { notes, reflectionPillars, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    if (isInitialized && user && firestore && reflectionPillars.length === 0) {
        const batch = writeBatch(firestore);
        defaultPillars.forEach(pillar => {
            const pillarId = uuidv4();
            const pillarRef = doc(firestore, 'users', user.uid, 'reflection-pillars', pillarId);
            batch.set(pillarRef, {
                ...pillar,
                id: pillarId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
        batch.commit().catch(error => {
            console.error("Failed to seed reflection pillars:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'initialiser les piliers de réflexion.' });
        });
    }
  }, [isInitialized, user, firestore, reflectionPillars, toast]);

  const addPillar = async (values: {title: string, description: string}) => {
    if (!user || !firestore) return;
    const pillarId = uuidv4();
    const pillarRef = doc(firestore, 'users', user.uid, 'reflection-pillars', pillarId);
    try {
        await setDoc(pillarRef, { ...values, id: pillarId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        toast({ title: 'Pilier ajouté !' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter le pilier.' });
    }
  }

  const editPillar = async (pillarId: string, values: {title: string, description: string}) => {
    if (!user || !firestore) return;
    const pillarRef = doc(firestore, 'users', user.uid, 'reflection-pillars', pillarId);
    try {
        await updateDoc(pillarRef, { ...values, updatedAt: new Date().toISOString() });
        toast({ title: 'Pilier mis à jour !' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le pilier.' });
    }
  }

  const deletePillar = async (pillarId: string) => {
    if (!user || !firestore) return;
    const pillarRef = doc(firestore, 'users', user.uid, 'reflection-pillars', pillarId);
    try {
        await deleteDoc(pillarRef);
        toast({ title: 'Pilier supprimé.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le pilier.' });
    }
  }


  const handleAddNote = async () => {
    if (!user || !firestore || !newNoteContent.trim()) {
      if (!newNoteContent.trim()) {
        toast({ variant: 'destructive', title: 'Le contenu ne peut pas être vide.' });
      }
      return;
    }
    const noteId = uuidv4();
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    const newNote: Note = {
      id: noteId,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(noteRef, newNote);
      setNewNoteContent('');
      toast({ title: 'Idée sauvegardée !' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la note.' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'notes', noteId));
      toast({ title: 'Note supprimée.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la note.' });
    }
  };

  return (
    <div className="space-y-8">
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        Piliers de Réflexion
                    </h2>
                    <p className="text-muted-foreground">Vos grandes questions stratégiques pour guider vos actions.</p>
                </div>
                <ManagePillarDialog onSave={addPillar}>
                    <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Ajouter un pilier</Button>
                </ManagePillarDialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {isInitialized ? (
                    reflectionPillars.map(pillar => (
                        <Card key={pillar.id} className="h-full flex flex-col">
                            <CardHeader className="flex-row items-start justify-between">
                                <CardTitle className="text-lg">{pillar.title}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <ManagePillarDialog pillar={pillar} onSave={(values) => editPillar(pillar.id, values)}>
                                            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                                <Pencil className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                        </ManagePillarDialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-500">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>Cette action est irréversible et supprimera ce pilier de réflexion.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deletePillar(pillar.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{pillar.description}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
                )}
            </div>
        </div>

        <Separator />

        <div>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-2">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                Boîte à Idées Rapides
            </h2>
             <Card>
                <CardHeader>
                    <CardTitle>Capturer une nouvelle idée</CardTitle>
                    <CardDescription>
                        Notez rapidement vos pensées. Vous pourrez les transformer en tâches, projets ou habitudes plus tard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col gap-4">
                    <Textarea
                    placeholder="Ex: Écrire un article sur l'IA, Apprendre à cuisiner des pâtes carbonara..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    />
                    <Button onClick={handleAddNote} className="self-end">Sauvegarder l'idée</Button>
                </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {!isInitialized ? (
                <>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full sm:block hidden" />
                    <Skeleton className="h-40 w-full lg:block hidden" />
                </>
                ) : notes.length > 0 ? (
                <AnimatePresence>
                    {notes.sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()).map((note) => (
                    <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-full"
                    >
                        <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardContent className="p-4 flex-1">
                            <p className="text-foreground/90 break-words whitespace-pre-wrap">{note.content}</p>
                        </CardContent>
                        <CardFooter className="p-3 pt-2 flex justify-between items-center border-t mt-auto">
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(note.createdAt as string), 'd MMM yyyy', {locale: fr})}
                            </p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                            </Button>
                        </CardFooter>
                        </Card>
                    </motion.div>
                    ))}
                </AnimatePresence>
                ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <p className="text-lg font-medium">Votre boîte à idées est vide.</p>
                    <p>Utilisez le champ ci-dessus pour capturer votre première idée !</p>
                </div>
                )}
            </div>
        </div>
    </div>
  );
}
