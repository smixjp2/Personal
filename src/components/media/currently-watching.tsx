'use client';

import type { WatchlistItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';
import { useData } from '@/contexts/data-context';

export function CurrentlyWatching() {
  const { watchlist, isInitialized } = useData();

  const currentItem = watchlist.find(i => i.currentlyWatching) || null;

  const watchingImage = PlaceHolderImages.find(
    (img) => img.id === 'currently-watching'
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>En cours de visionnage</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {!isInitialized ? (
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
            <div>
                <h3 className="font-semibold text-lg">{currentItem.title}</h3>
                {currentItem.category === 'tv-show' && (currentItem.season || currentItem.episode) && (
                    <p className="text-sm text-muted-foreground">
                        {currentItem.season && `Saison ${currentItem.season}`}
                        {currentItem.season && currentItem.episode && ' - '}
                        {currentItem.episode && `Épisode ${currentItem.episode}`}
                    </p>
                )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-8">
            <Film className="h-10 w-10 mb-4"/>
            <p>Rien en cours de visionnage.</p>
            <p className="text-sm">Définissez un film ou une série comme en cours depuis la liste.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
