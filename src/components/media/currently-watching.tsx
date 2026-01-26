'use client';

import type { WatchlistItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';
import { useData } from '@/contexts/data-context';

export function CurrentlyWatching() {
  const { watchlist, isInitialized } = useData();

  const currentItem = watchlist.find(i => i.currentlyWatching) || null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>En cours de visionnage</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {!isInitialized ? (
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : currentItem ? (
          <div className="text-center">
            <h3 className="font-semibold text-xl">{currentItem.title}</h3>
            {currentItem.category === 'tv-show' && (currentItem.season || currentItem.episode) && (
                <p className="text-md text-muted-foreground">
                    {currentItem.season && `Saison ${currentItem.season}`}
                    {currentItem.season && currentItem.episode && ' - '}
                    {currentItem.episode && `Épisode ${currentItem.episode}`}
                </p>
            )}
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
