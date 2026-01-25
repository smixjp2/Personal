
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  QueryConstraint,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
}

export function useCollection<T>(
  collectionPath: string | null,
  options?: UseCollectionOptions
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const constraints = options?.constraints || [];

  const queryMemo = useMemo(() => {
    if (!firestore || !collectionPath) return null;
    return query(collection(firestore, collectionPath), ...constraints);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, collectionPath, ...constraints.map(c => c.toString())]);


  useEffect(() => {
    if (!queryMemo) {
      setIsLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      queryMemo,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setIsLoading(false);
      },
      (err) => {
        console.error(`Error fetching collection ${collectionPath}:`, err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, queryMemo, collectionPath]);

  return { data, isLoading, error };
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
