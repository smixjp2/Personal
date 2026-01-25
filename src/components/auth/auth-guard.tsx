'use client';

import { useUser } from '@/firebase/auth/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasFirebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
      </div>
    );
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  if (!isError && user) {
    return <>{children}</>;
  }

  if (isError) {
     return (
        <div className="container mx-auto max-w-4xl p-4">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Action Requise : Configuration Firebase Manquante</AlertTitle>
                <AlertDescription>
                    <p>Votre application ne peut pas se connecter à Firebase car la configuration est manquante ou invalide.</p>
                    <p className="mt-2">Pour corriger cela, vous devez ajouter la configuration de votre projet Firebase aux variables d'environnement. Consultez <strong>.env.local.example</strong> pour les variables requises.</p>
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return null;
}
