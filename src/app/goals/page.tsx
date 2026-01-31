import Link from 'next/link';
import { User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoalsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold font-headline">Objectifs 2026</h1>
       </div>
       <p className="text-lg text-muted-foreground">
         Sélectionnez une catégorie pour voir vos objectifs ou en ajouter de nouveaux.
       </p>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <Link href="/goals/personal" className="block group">
             <Card className="h-full transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-2xl group-hover:-translate-y-2">
                <CardHeader>
                   <CardTitle className="flex flex-col items-center justify-center text-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-full transition-colors group-hover:bg-primary">
                         <User className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                      </div>
                      <span className="text-2xl">Personnel</span>
                   </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                   <p className="text-muted-foreground">Objectifs liés à votre développement personnel, santé, passions et vie privée.</p>
                </CardContent>
             </Card>
          </Link>
          <Link href="/goals/professional" className="block group">
             <Card className="h-full transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-2xl group-hover:-translate-y-2">
                <CardHeader>
                   <CardTitle className="flex flex-col items-center justify-center text-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-full transition-colors group-hover:bg-primary">
                         <Briefcase className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                      </div>
                      <span className="text-2xl">Professionnel</span>
                   </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                   <p className="text-muted-foreground">Objectifs liés à votre carrière, compétences professionnelles et projets d'entreprise.</p>
                </CardContent>
             </Card>
          </Link>
       </div>
    </div>
  );
}
