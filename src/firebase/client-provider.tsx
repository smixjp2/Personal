'use client';

import { ReactNode, useMemo } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const { app, auth, firestore } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider
      app={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
      <Toaster />
    </FirebaseProvider>
  );
}
