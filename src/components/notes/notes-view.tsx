
'use client';

import { useState } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, Trash2, BrainCircuit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '../ui/separator';

const reflectionPillars = [
    { id: 'pillar-projections', title: 'Mes projections dans le futur', description: "Où vous voyez-vous dans 1, 5, 10 ans ? Quels sont vos grands rêves ?" },
    { id: 'pillar-compliments', title: 'Liste des compliments', description: "Notez les compliments que les gens vous font. C'est une source de confiance et de prise de conscience de vos forces." },
    { id: 'pillar-market-value', title: 'Ma valeur sur le marché', description: "Combien valez-vous professionnellement ? Quelles compétences sont les plus demandées ?" },
    { id: 'pillar-investments', title: 'Autres moyens d\'investissement', description: "Explorez de nouvelles avenues pour faire fructifier votre capital au-delà des options actuelles." },
    { id: 'pillar-us-market', title: 'Intégrer la bourse USA', description: "Quelles sont les étapes, les plateformes et les stratégies pour investir sur le marché américain ?" },
    { id: 'pillar-retirement', title: 'Retraites complémentaires', description: "Quelles options de retraite existent pour compléter le système de base ?" },
];

export function NotesView() {
  const { notes, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newNoteContent, setNewNoteContent] = useState('');

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
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                Piliers de Réflexion
            </h2>
            <p className="text-muted-foreground">Vos grandes questions stratégiques pour guider vos actions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {reflectionPillars.map(pillar => (
                    <Card key={pillar.id} className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">{pillar.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{pillar.description}</p>
                        </CardContent>
                    </Card>
                ))}
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
