
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  signOut,
} from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { hasFirebaseConfig } from '@/firebase/config';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );
}

export default function LoginPage() {
  const app = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();
  const allowedEmail = 'serrou.mohammed@outlook.com';

  const handleGoogleSignIn = async () => {
    if (!app || !hasFirebaseConfig()) {
        toast({
            variant: 'destructive',
            title: 'Erreur de Configuration',
            description: 'Firebase n\'est pas configuré correctement. Veuillez vérifier vos variables d\'environnement.',
        });
        return;
    }

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      if (result.user.email !== allowedEmail) {
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Accès non autorisé',
          description: `Seul l'email ${allowedEmail} est autorisé à se connecter.`,
        });
        return;
      }

      await createUserProfile(firestore, result.user);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Échec de l\'authentification',
        description:
          error.message || 'Impossible de vous connecter avec Google. Veuillez réessayer.',
      });
      console.error('Authentication error:', error);
    }
  };

  const createUserProfile = async (firestore: any, user: User) => {
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
    }, { merge: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Accès Personnel</CardTitle>
          <CardDescription>Connectez-vous pour accéder à votre espace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Se connecter avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
