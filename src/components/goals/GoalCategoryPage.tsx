
"use client";

import type { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { AddGoalDialog } from "./add-goal-dialog";
import { Plus, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from 'uuid';
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type GoalCategoryPageProps = {
    category: 'personal' | 'professional';
    categoryName: string;
    description?: string;
}

export function GoalCategoryPage({ category, categoryName, description }: GoalCategoryPageProps) {
  const { goals, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addGoal = async (newGoalData: Omit<Goal, 'id' | 'progress'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification", description: "Vous devez être connecté pour ajouter un objectif." });
      return;
    }
    const newGoal: Goal = {
      ...newGoalData,
      id: uuidv4(),
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "goals", newGoal.id), newGoal);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de sauvegarder le nouvel objectif." });
    }
  };

  const editGoal = async (goalId: string, updatedData: Partial<Omit<Goal, 'id'>>) => {
    if (!user || !firestore) return;
    if (goalId.startsWith('static-')) {
      toast({ variant: "destructive", title: "Action non autorisée", description: "Cet objectif pré-rempli sera bientôt entièrement modifiable." });
      return;
    }
    try {
      await updateDoc(doc(firestore, "users", user.uid, "goals", goalId), {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de modifier l'objectif." });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;
    if (goalId.startsWith('static-')) {
      toast({ variant: "destructive", title: "Action non autorisée", description: "Cet objectif pré-rempli sera bientôt entièrement modifiable." });
      return;
    }
    try {
      await deleteDoc(doc(firestore, "users", user.uid, "goals", goalId));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de supprimer l'objectif." });
    }
  };
  
  const allStaticGoals: Goal[] = [
    {
        id: 'static-fmva-goal',
        name: 'Obtenir la certification FMVA',
        description: "Valider la certification Financial Modeling & Valuation Analyst pour renforcer les compétences en finance d'entreprise.",
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 5,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-fmva')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-fmva')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
     {
        id: 'static-language-cert-goal',
        name: 'Obtenir une certification de langue',
        description: 'Passer et réussir un test de langue reconnu comme le TOEFL, IELTS ou TCF.',
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-language-cert')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-language-cert')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-wealth-management-cert-goal',
        name: 'Certification Wealth Management',
        description: 'Obtenir la certification en Wealth Management de la Bourse de Casablanca (coût: 5000 DH).',
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-wealth-management')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-wealth-management')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-bilan-competence-goal',
        name: 'Faire un bilan de compétence',
        description: "Réaliser un bilan de compétences pour évaluer mes points forts et axes d'amélioration.",
        category: 'professional',
        subCategory: 'Carrière',
        dueDate: new Date(2026, 8, 30).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-bilan-competence')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-bilan-competence')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-costumes-goal',
      name: 'Acheter 2 costumes complets',
      description: "Acquérir deux costumes de qualité professionnelle pour les rendez-vous importants d'ici fin 2026.",
      category: 'personal',
      subCategory: 'Style',
      dueDate: new Date(2026, 11, 31).toISOString(),
      progress: 0,
      imageUrl: PlaceHolderImages.find(p => p.id === 'goal-costumes')?.imageUrl,
      imageHint: PlaceHolderImages.find(p => p.id === 'goal-costumes')?.imageHint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-learning-goal',
        name: 'Apprendre Espagnol, VBA, SQL & Python',
        description: 'Acquérir des compétences de base en Espagnol et des compétences solides en VBA, SQL et Python.',
        category: 'personal',
        subCategory: 'Apprentissage',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-learning')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-learning')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-advantage-goal',
        name: "Trouver mon 'unfair advantage'",
        description: "Identifier et documenter mon avantage concurrentiel pour mieux orienter mes choix de carrière et projets.",
        category: 'personal',
        subCategory: 'Développement personnel',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-unfair-advantage')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-unfair-advantage')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-achievements-goal',
        name: "Lister mes réalisations",
        description: "Créer une liste de toutes mes réalisations passées pour renforcer ma confiance et mon CV.",
        category: 'personal',
        subCategory: 'Réflexion',
        dueDate: new Date(2026, 3, 30).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-achievements')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-achievements')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-network-goal',
        name: "Développer mon réseau",
        description: "Établir des connexions significatives avec des professionnels de mon secteur.",
        category: 'professional',
        subCategory: 'Networking',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-network')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-network')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-cv-functional-goal',
        name: "Mettre à jour le CV fonctionnel",
        description: "Créer un CV fonctionnel mettant en avant les compétences plutôt que l'expérience chronologique.",
        category: 'professional',
        subCategory: 'Carrière',
        dueDate: new Date(2026, 4, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-cv-functional')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-cv-functional')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-monetize-cfo-goal',
        name: "Monétiser 'The Moroccan CFO'",
        description: "Mettre en place une stratégie de monétisation pour la chaîne (partenariats, ads, etc.).",
        category: 'professional',
        subCategory: 'Création de contenu',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-monetize-cfo')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-monetize-cfo')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'static-youtube-monetization-goal',
        name: "Monétiser 3 chaînes YouTube",
        description: "Avoir au moins 3 chaînes YouTube monétisées en France et aux USA d'ici fin 2026.",
        category: 'professional',
        subCategory: 'Création de contenu',
        dueDate: new Date(2026, 11, 31).toISOString(),
        progress: 0,
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-monetize-youtube')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-monetize-youtube')?.imageHint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
  ];

  if (!isInitialized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full hidden lg:block" />
            </div>
      </div>
    )
  }

  const staticGoalsForCategory = allStaticGoals.filter(g => g.category === category);
  const baseGoals = goals.filter(g => g.category === category && new Date(g.dueDate).getFullYear() === 2026);
  
  const uniqueStaticGoals = staticGoalsForCategory.filter(sg => !baseGoals.some(bg => bg.id === sg.id));
  
  const filteredGoals = [...uniqueStaticGoals, ...baseGoals];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/goals">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold font-headline">Objectifs {categoryName} 2026</h1>
        </div>
        <AddGoalDialog onAddGoal={addGoal} defaultCategory={category}>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un objectif
            </button>
        </AddGoalDialog>
      </div>

      {description && <p className="text-lg text-muted-foreground">{description}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <AnimatePresence>
            {filteredGoals.length > 0 ? filteredGoals.map((goal) => (
                <motion.div key={goal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <GoalCard 
                        goal={goal}
                        onEdit={(updatedData) => editGoal(goal.id, updatedData)}
                        onDelete={() => deleteGoal(goal.id)}
                    />
                </motion.div>
            )) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>Aucun objectif {categoryName.toLowerCase()} pour 2026.</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
