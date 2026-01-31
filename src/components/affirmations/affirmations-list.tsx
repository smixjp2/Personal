
'use client';

import { useState } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Affirmation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Trash2, Quote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AffirmationsList() {
  const { affirmations, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newAffirmationContent, setNewAffirmationContent] = useState('');

  const handleAddAffirmation = async () => {
    if (!user || !firestore || !newAffirmationContent.trim()) {
      if (!newAffirmationContent.trim()) {
        toast({ variant: 'destructive', title: 'Le contenu ne peut pas être vide.' });
      }
      return;
    }

    const affirmationId = uuidv4();
    const affirmationRef = doc(firestore, 'users', user.uid, 'affirmations', affirmationId);
    
    const newAffirmation: Affirmation = {
      id: affirmationId,
      content: newAffirmationContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(affirmationRef, newAffirmation);
      setNewAffirmationContent('');
      toast({ title: 'Affirmation ajoutée !' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder l\'affirmation.' });
    }
  };

  const handleDeleteAffirmation = async (affirmationId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'affirmations', affirmationId));
      toast({ title: 'Affirmation supprimée.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'affirmation.' });
    }
  };

  const sortedAffirmations = affirmations.sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une nouvelle affirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Ex: Je suis capable de réaliser de grandes choses."
              value={newAffirmationContent}
              onChange={(e) => setNewAffirmationContent(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddAffirmation} className="self-end">Sauvegarder</Button>
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
        ) : sortedAffirmations.length > 0 ? (
          <AnimatePresence>
            {sortedAffirmations.map((affirmation) => (
              <motion.div
                key={affirmation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <Card className="hover:shadow-lg transition-shadow flex flex-col h-full bg-card/50 border-primary/20">
                   <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                      <Quote className="h-8 w-8 text-primary/50 mb-4" />
                      <p className="text-lg font-medium text-foreground/90 break-words whitespace-pre-wrap">{affirmation.content}</p>
                  </CardContent>
                  <CardFooter className="p-3 pt-2 flex justify-end items-center border-t mt-auto">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAffirmation(affirmation.id)}>
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
            <Sparkles className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Commencez à construire votre confiance.</p>
            <p>Utilisez le champ ci-dessus pour ajouter votre première affirmation !</p>
          </div>
        )}
      </div>
    </>
  );
}
