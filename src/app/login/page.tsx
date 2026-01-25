
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Chrome } from 'lucide-react';
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
            <Chrome className="mr-2" />
            Se connecter avec Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
