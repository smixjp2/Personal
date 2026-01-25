'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

export function CurrentlyReading() {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const readingImage = PlaceHolderImages.find(
    (img) => img.id === 'currently-reading'
  );

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'readingList'),
      where('read', '==', false),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCurrentBook({ id: doc.id, ...doc.data() } as Book);
      } else {
        setCurrentBook(null);
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
        <CardTitle>Lecture en cours</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : currentBook && readingImage ? (
          <div className="space-y-4">
             <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                    src={readingImage.imageUrl}
                    alt={readingImage.description}
                    data-ai-hint={readingImage.imageHint}
                    fill
                    className="object-cover"
                />
             </div>
            <div>
                <h3 className="font-semibold text-lg">{currentBook.title}</h3>
                {currentBook.author && <p className="text-sm text-muted-foreground">par {currentBook.author}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground p-8">
            <BookOpen className="h-10 w-10 mb-4"/>
            <p>Aucune lecture en cours.</p>
            <p className="text-sm">Ajoutez un livre à votre liste de lecture.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
