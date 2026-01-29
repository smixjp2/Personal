'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { writeBatch, doc } from 'firebase/firestore';
import type { WatchlistItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useData } from '@/contexts/data-context';

const moviesToAdd = [
  { title: 'The Shadow’s Edge', category: 'movie' },
  { title: 'The Covenant', category: 'movie' },
  { title: 'Afterburn', category: 'movie' },
  { title: 'The Blackout', category: 'movie' },
  { title: 'American Factory', category: 'movie' },
  { title: 'Three Thousand Years of Longing', category: 'movie' },
  { title: 'O Brother, Where Art Thou?', category: 'movie' },
  { title: 'The Fortress', category: 'movie' },
  { title: 'The Wandering Earth', category: 'movie' },
  { title: 'The Ultimate Gift', category: 'movie' },
  { title: 'Bad Trip', category: 'movie' },
  { title: 'Superhero Movie', category: 'movie' },
  { title: 'Trust No One', category: 'movie' },
  { title: 'The Last 7 Days', category: 'movie' },
  { title: 'Triangle', category: 'movie' },
  { title: 'Money Explained', category: 'movie' },
  { title: 'Get Smart with Money', category: 'movie' },
  { title: 'Life in Pieces', category: 'movie' },
  { title: 'How to Get Rich', category: 'movie' },
  { title: 'Everybody Loves Touda', category: 'movie' },
  { title: 'Being There', category: 'movie' },
  { title: 'Narvik', category: 'movie' },
  { title: 'Buy Now: The Shopping Conspiracy', category: 'movie' },
];


export function SeedWatchlistButton() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { watchlist } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSeed = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to seed the watchlist.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const batch = writeBatch(firestore);
      const existingTitles = new Set(watchlist.map(item => item.title.toLowerCase()));

      const itemsToAdd = moviesToAdd.filter(item => !existingTitles.has(item.title.toLowerCase()));

      if (itemsToAdd.length === 0) {
        toast({
          title: 'Watchlist Already Stocked!',
          description: 'It looks like all these items are already in your list.',
        });
        setIsDone(true);
        setIsLoading(false);
        return;
      }

      itemsToAdd.forEach(item => {
        const newItemId = uuidv4();
        const itemRef = doc(firestore, 'users', user.uid, 'watchlist', newItemId);
        const newWatchlistItem: Omit<WatchlistItem, 'id'> & { id: string } = {
          id: newItemId,
          title: item.title,
          category: item.category as "movie" | "tv-show",
          watched: false,
          currentlyWatching: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        batch.set(itemRef, newWatchlistItem);
      });

      await batch.commit();
      toast({
        title: 'Watchlist Seeded!',
        description: `${itemsToAdd.length} new items have been added to your watchlist.`,
      });
      setIsDone(true);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.message || 'Could not add items to your watchlist.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isDone) {
    return (
        <div className="flex justify-center items-center p-4 border-2 border-dashed rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-center text-green-700 dark:text-green-300">
                Your watchlist has been filled! I can remove this seeding button for you now, just let me know.
            </p>
        </div>
    );
  }

  return (
    <div className="flex justify-center p-4 border-2 border-dashed rounded-lg">
      <Button onClick={handleSeed} disabled={isLoading}>
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            Ajout en cours...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Cliquez pour ajouter {moviesToAdd.length} films et séries à la liste
          </>
        )}
      </Button>
    </div>
  );
}
