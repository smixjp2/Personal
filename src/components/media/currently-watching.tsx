'use client';

import { useState, useEffect } from 'react';
import type { WatchlistItem } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';

export function CurrentlyWatching() {
  const [currentItem, setCurrentItem] = useState<WatchlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const watchingImage = PlaceHolderImages.find(
    (img) => img.id === 'currently-watching'
  );

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'watchlist'),
      where('watched', '==', false),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCurrentItem({ id: doc.id, ...doc.data() } as WatchlistItem);
      } else {
        setCurrentItem(null);
      }
      setIsLoading(false);
    }, () => {
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>En cours de visionnage</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : currentItem && watchingImage ? (
          <div className="space-y-4">
             <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                    src={watchingImage.imageUrl}
                    alt={watchingImage.description}
                    data-ai-hint={watchingImage.imageHint}
                    fill
                    className="object-cover"
                />
             </div>
            <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-primary"/>
                <h3 className="font-semibold text-lg">{currentItem.title}</h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-8">
            <Film className="h-10 w-10 mb-4"/>
            <p>Rien en cours de visionnage.</p>
            <p className="text-sm">Ajoutez un film ou une série à votre liste.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
