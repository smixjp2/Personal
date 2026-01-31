
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
import { Lightbulb, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotesInbox() {
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
    if (!user || !firestore || noteId.startsWith('static-')) {
      toast({ variant: 'destructive', title: 'Action non autorisée', description: 'Cette note statique ne peut pas être supprimée.' });
      return;
    }
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'notes', noteId));
      toast({ title: 'Note supprimée.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la note.' });
    }
  };

  const staticNotes: Note[] = [
    {
      id: 'static-usa-bourse-note',
      content: 'Comment intégrer la bourse des USA ?',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-retraite-note',
      content: 'Chercher les options de retraites complémentaires.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const allNotes = [...notes];
  const uniqueStaticNotes = staticNotes.filter(sn => !allNotes.some(n => n.id === sn.id));
  const combinedNotes = [...uniqueStaticNotes, ...allNotes];


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Boîte à Idées</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!isInitialized ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full sm:block hidden" />
            <Skeleton className="h-40 w-full lg:block hidden" />
          </>
        ) : combinedNotes.length > 0 ? (
          <AnimatePresence>
            {combinedNotes.sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()).map((note) => (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)} disabled={note.id.startsWith('static-')}>
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
            <Lightbulb className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Votre boîte à idées est vide.</p>
            <p>Utilisez le champ ci-dessus pour capturer votre première idée !</p>
          </div>
        )}
      </div>
    </div>
  );
}
