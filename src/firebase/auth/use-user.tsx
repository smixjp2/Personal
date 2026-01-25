'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';

type UserState = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
};

export function useUser(): UserState {
  const app = useFirebaseApp();
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    if (!app) {
        setUserState({ user: null, isLoading: false, isError: true });
        return;
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserState({ user, isLoading: false, isError: false });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setUserState({ user: null, isLoading: false, isError: true });
      }
    );

    return () => unsubscribe();
  }, [app]);

  return userState;
}
