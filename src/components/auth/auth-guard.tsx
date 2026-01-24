'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FirebaseConfigWarning } from './firebase-config-warning';

const ALLOWED_EMAIL = 'serrou.mohammed@outlook.com';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Directly check if the Firebase auth object was initialized.
  // If not, the config is missing, and we should show the warning.
  if (!auth) {
    return <FirebaseConfigWarning />;
  }

  useEffect(() => {
    // Because of the check above, 'auth' is guaranteed to be non-null here.
    const unsubscribe = onAuthStateChanged(auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          if (currentUser.email?.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
            setAccessDenied(true);
          } else {
            setAccessDenied(false);
          }
        } else {
          setUser(null);
          router.push('/login');
        }
        setLoading(false);
      },
      (error) => {
        // This is now a fallback for other unexpected auth errors.
        console.error("Firebase Auth Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    // 'auth' is guaranteed to be non-null here as well.
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[125px]" />
                <Skeleton className="h-[125px]" />
                <Skeleton className="h-[125px]" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Skeleton className="h-80" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-80" />
                </div>
            </div>
        </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Sorry, you do not have permission to access this application. Please sign in with the correct account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Signed in as: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <Button onClick={handleLogout} variant="destructive">
              Sign Out and Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return null; // Should be redirected by the effect
}

export default AuthGuard;
