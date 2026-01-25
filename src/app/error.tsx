'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // The specific Firebase config error is now handled gracefully in the AuthGuard component.
  // This component now serves as a generic fallback for other unexpected errors.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-2xl">Quelque chose s'est mal passé !</CardTitle>
                <CardDescription>
                    Une erreur inattendue est survenue. Vous pouvez essayer de recharger la page.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button onClick={() => reset()}>
                    Réessayer
                </Button>
                <p className="text-xs text-muted-foreground">Erreur : {error.message}</p>
            </CardContent>
        </Card>
    </div>
  );
}
