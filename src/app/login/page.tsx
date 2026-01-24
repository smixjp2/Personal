'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome to Life Architect</CardTitle>
          <CardDescription>Sign in to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
