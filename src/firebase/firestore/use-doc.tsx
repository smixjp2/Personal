'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, doc, DocumentReference, DocumentData, FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useDoc<T>(docPath: string | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore || !docPath) {
        if (firestore) { // only set loading to false if firestore is available but path is not
            setIsLoading(false);
        }
        return;
    }

    const docRef = doc(firestore, docPath);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setIsLoading(false);
      },
      (err) => {
        console.error(`Error fetching document ${docPath}:`, err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, docPath]);

  return { data, isLoading, error };
}
