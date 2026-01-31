import Link from 'next/link';
import { Plane, Repeat, Wallet, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const personalCategories = [
  {
    href: "/goals/personal/travel",
    title: "Voyages",
    description: "Planifiez et suivez vos futures aventures.",
    icon: Plane,
  },
  {
    href: "/habits",
    title: "Habitudes",
    description: "Suivez vos routines et construisez de nouvelles habitudes.",
    icon: Repeat,
  },
  {
    href: "/finances",
    title: "Argent",
    description: "Gérez vos finances, épargne et investissements.",
    icon: Wallet,
  },
  {
    href: "/finances",
    title: "Liste d'achats",
    description: "Planifiez vos dépenses et achats mensuels.",
    icon: ShoppingCart,
  },
];

export default function PersonalGoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/goals">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-headline">Objectifs Personnels</h1>
      </div>
       <p className="text-lg text-muted-foreground">
         Explorez et gérez les différentes facettes de votre vie personnelle.
       </p>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {personalCategories.map((category) => (
          <Link href={category.href} key={category.title} className="block group h-full">
             <Card className="h-full flex flex-col justify-center transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader>
                   <CardTitle className="flex flex-col items-center justify-center text-center gap-3">
                      <div className="bg-primary/10 p-4 rounded-full transition-colors group-hover:bg-primary">
                         <category.icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
                      </div>
                      <span className="text-xl font-semibold">{category.title}</span>
                   </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm">
                   <p className="text-muted-foreground">{category.description}</p>
                </CardContent>
             </Card>
          </Link>
        ))}
       </div>
    </div>
  );
}