'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { ProjectNote } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ProjectNotes({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newNoteContent, setNewNoteContent] = useState('');

  const notesPath = user ? `users/${user.uid}/projects/${projectId}/notes` : null;
  const { data: notes, isLoading } = useCollection<ProjectNote>(notesPath);

  const handleAddNote = async () => {
    if (!user || !firestore || !notesPath || !newNoteContent.trim()) {
      if (!newNoteContent.trim()) toast({ variant: 'destructive', title: 'La note ne peut pas être vide.' });
      return;
    }

    const noteId = uuidv4();
    const noteRef = doc(firestore, notesPath, noteId);
    const newNote: ProjectNote = {
      id: noteId,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(noteRef, newNote);
      setNewNoteContent('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la note.' });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user || !firestore || !notesPath) return;
    try {
      await deleteDoc(doc(firestore, notesPath, noteId));
      toast({ title: 'Note supprimée.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la note.' });
    }
  };
  
  const sortedNotes = notes?.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Idées &amp; Notes de Projet</CardTitle>
        <CardDescription>Gardez une trace de vos idées, réflexions et plans.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Nouvelle note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={2}
          />
          <Button onClick={handleAddNote} size="icon"><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-2">
            {isLoading && <Skeleton className="h-20 w-full" />}
            {!isLoading && sortedNotes && sortedNotes.length > 0 ? (
                <AnimatePresence>
                {sortedNotes.map((note) => (
                    <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="bg-muted/50">
                            <CardContent className="p-3 text-sm whitespace-pre-wrap break-words">
                                {note.content}
                            </CardContent>
                            <CardFooter className="p-3 pt-0 flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(note.createdAt as string), 'd MMM yyyy', {locale: fr})}
                                </p>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteNote(note.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
                </AnimatePresence>
            ) : !isLoading && (
                <p className="text-center text-muted-foreground py-6">Aucune note pour ce projet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
