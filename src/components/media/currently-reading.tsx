'use client';

import type { Book } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';
import { useData } from '@/contexts/data-context';

export function CurrentlyReading() {
  const { readingList, isInitialized } = useData();

  const currentBook = readingList.find(b => b.currentlyReading) || null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Lecture en cours</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        {!isInitialized ? (
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : currentBook ? (
          <div className="text-center">
            <h3 className="font-semibold text-xl">{currentBook.title}</h3>
            {currentBook.author && <p className="text-md text-muted-foreground">par {currentBook.author}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-8">
            <BookOpen className="h-10 w-10 mb-4"/>
            <p>Aucune lecture en cours.</p>
            <p className="text-sm">Définissez un livre comme lecture en cours depuis la liste.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
