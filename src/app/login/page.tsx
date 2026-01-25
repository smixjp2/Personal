
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Terminal } from 'lucide-react';
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

function ConfigGuide() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Finalisez la configuration (Guide détaillé)</CardTitle>
        <CardDescription className="text-center">
          Pour des raisons de sécurité, je ne peux pas faire cette dernière étape pour vous. Suivez ce guide pour finaliser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-left">
          <div className="space-y-2">
              <p className="font-semibold">Étape 1 : Créer le fichier de configuration</p>
              <p className="text-muted-foreground">
                  Dans votre projet, trouvez le fichier nommé <code className="bg-muted px-1 py-0.5 rounded">.env.local.example</code>. Faites-en une copie et renommez cette copie en <code className="bg-muted px-1 py-0.5 rounded">.env.local</code>. C'est dans ce nouveau fichier que nous allons coller vos clés.
              </p>
          </div>
          <div className="space-y-2">
              <p className="font-semibold">Étape 2 : Trouver vos clés dans Firebase</p>
              <p className="text-muted-foreground">
                  Ouvrez la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">console Firebase</a>. Allez dans les <strong className="font-semibold text-foreground">Paramètres du projet</strong> (icône d'engrenage en haut à gauche), puis dans l'onglet <strong className="font-semibold text-foreground">Général</strong>. Faites défiler vers le bas jusqu'à la section <strong className="font-semibold text-foreground">Vos applications</strong>.
              </p>
          </div>
          <div className="space-y-2">
              <p className="font-semibold">Étape 3 : Copier la configuration</p>
              <p className="text-muted-foreground">
                  Dans la section "Vos applications", sélectionnez votre application web. Vous verrez un objet de configuration JavaScript qui ressemble à ceci. Cliquez sur le bouton pour le copier.
              </p>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  <code>
{`const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345...:web:..."
};`}
                  </code>
              </pre>
          </div>
          <div className="space-y-2">
              <p className="font-semibold">Étape 4 : Coller et formater les clés</p>
              <p className="text-muted-foreground">
                  Ouvrez votre fichier <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> et collez-y les clés copiées, mais en les formatant comme ceci (remplacez les `...` par vos valeurs réelles) :
              </p>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  <code>
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345...
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345...:web:...`}
                  </code>
              </pre>
          </div>
          <div className="space-y-2">
              <p className="font-semibold">Étape 5 : Activer la connexion Google</p>
              <p className="text-muted-foreground">
                  Dans la console Firebase, allez dans la section <code className="bg-muted px-1 py-0.5 rounded">Authentication</code> (dans le menu de gauche), puis dans l'onglet <code className="bg-muted px-1 py-0.5 rounded">Sign-in method</code> et activez <strong className="font-semibold text-foreground">Google</strong> comme fournisseur.
              </p>
          </div>
          <div className="space-y-2">
              <p className="font-semibold">Étape 6 : Redémarrer l'application</p>
              <p className="text-muted-foreground">
                  Arrêtez votre serveur de développement et redémarrez-le. Cette page se mettra à jour automatiquement et affichera le bouton de connexion.
              </p>
          </div>
      </CardContent>
    </Card>
  );
}


export default function LoginPage() {
  const app = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();
  const allowedEmail = 'serroumohammed7@gmail.com';
  
  if (!hasFirebaseConfig()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <ConfigGuide />
      </div>
    );
  }
  
  const handleGoogleSignIn = async () => {
    if (!app) {
        toast({
            variant: "destructive",
            title: "Erreur de Configuration",
            description: "L'application Firebase n'est pas configurée. Vérifiez vos clés dans .env.local.",
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
          variant: "destructive",
          title: "Accès non autorisé",
          description: `Seul l'email ${allowedEmail} est autorisé à se connecter.`,
        });
        return;
      }

      await createUserProfile(firestore, result.user);
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast({
          variant: "destructive",
          title: "Compte existant avec une autre méthode",
          description: "Un compte avec cet e-mail existe déjà (probablement créé manuellement). Veuillez le supprimer de la console Firebase avant de vous connecter avec Google.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Échec de l'authentification",
          description:
            error.message || "Impossible de vous connecter avec Google. Veuillez réessayer.",
        });
      }
      console.error("Authentication error:", error);
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
