
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { ShoppingItem, WatchlistItem, Book, Income, SavingGoal, Investment, Note, Goal, CalendarEvent, Habit, Affirmation, ReflectionPillar, Project } from '@/lib/types';
import { doc, runTransaction } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const defaultDailyHabits: Omit<Habit, 'createdAt' | 'updatedAt' | 'progress'>[] = [
    { id: 'default-brush-teeth', name: 'Se brosser les dents', icon: 'Smile', frequency: 'daily', goal: 1 },
    { id: 'default-wash-face', name: 'Se laver le visage', icon: 'Droplets', frequency: 'daily', goal: 1 },
    { id: 'default-make-breakfast', name: 'Préparer le petit-déjeuner', icon: 'Apple', frequency: 'daily', goal: 1 },
    { id: 'default-tidy-room', name: 'Ranger la chambre', icon: 'Bed', frequency: 'daily', goal: 1 },
    { id: 'default-study-fmva', name: 'Étudier 30 min pour FMVA', icon: 'BookOpen', frequency: 'daily', goal: 1, link: 'https://learn.corporatefinanceinstitute.com/dashboard', goalId: 'fmva-goal' },
    { id: 'default-read-book', name: 'Lire 10 min par jour un livre', icon: 'BookOpen', frequency: 'daily', goal: 1, goalId: 'learning-goal' },
];

const defaultPillars: Omit<ReflectionPillar, 'createdAt' | 'updatedAt'>[] = [
    { id: 'default-projections', title: 'Mes projections dans le futur', description: "Où vous voyez-vous dans 1, 5, 10 ans ? Quels sont vos grands rêves ?" },
    { id: 'default-compliments', title: 'Liste des compliments', description: "Notez les compliments que les gens vous font. C'est une source de confiance et de prise de conscience de vos forces." },
    { id: 'default-market-value', title: 'Ma valeur sur le marché', description: "Combien valez-vous professionnellement ? Quelles compétences sont les plus demandées ?" },
    { id: 'default-investments', title: 'Autres moyens d\'investissement', description: "Explorez de nouvelles avenues pour faire fructifier votre capital au-delà des options actuelles." },
    { id: 'default-usa-stock', title: 'Intégrer la bourse USA', description: "Quelles sont les étapes, les plateformes et les stratégies pour investir sur le marché américain ?" },
    { id: 'default-retirement', title: 'Retraites complémentaires', description: "Quelles options de retraite existent pour compléter le système de base ?" },
];

const defaultGoals: Omit<Goal, 'createdAt' | 'updatedAt' | 'progress'>[] = [
    {
        id: 'fmva-goal',
        name: 'Obtenir la certification FMVA',
        description: "Valider la certification Financial Modeling & Valuation Analyst pour renforcer les compétences en finance d'entreprise.",
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-fmva')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-fmva')?.imageHint,
    },
     {
        id: 'language-cert-goal',
        name: 'Obtenir une certification de langue',
        description: 'Passer et réussir un test de langue reconnu comme le TOEFL, IELTS ou TCF.',
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-language-cert')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-language-cert')?.imageHint,
    },
    {
        id: 'wealth-management-cert-goal',
        name: 'Certification Wealth Management',
        description: 'Obtenir la certification en Wealth Management de la Bourse de Casablanca (coût: 5000 DH).',
        category: 'professional',
        subCategory: 'Certification',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-wealth-management')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-wealth-management')?.imageHint,
    },
    {
        id: 'bilan-competence-goal',
        name: 'Faire un bilan de compétence',
        description: "Réaliser un bilan de compétences pour évaluer mes points forts et axes d'amélioration.",
        category: 'professional',
        subCategory: 'Carrière',
        dueDate: new Date(2026, 8, 30).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-bilan-competence')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-bilan-competence')?.imageHint,
    },
    {
      id: 'costumes-goal',
      name: 'Acheter 2 costumes complets',
      description: "Acquérir deux costumes de qualité professionnelle pour les rendez-vous importants d'ici fin 2026.",
      category: 'personal',
      subCategory: 'Style',
      dueDate: new Date(2026, 11, 31).toISOString(),
      imageUrl: PlaceHolderImages.find(p => p.id === 'goal-costumes')?.imageUrl,
      imageHint: PlaceHolderImages.find(p => p.id === 'goal-costumes')?.imageHint,
    },
    {
        id: 'learning-goal',
        name: 'Apprendre Espagnol, VBA, SQL & Python',
        description: 'Acquérir des compétences de base en Espagnol et des compétences solides en VBA, SQL et Python.',
        category: 'personal',
        subCategory: 'Apprentissage',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-learning')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-learning')?.imageHint,
    },
    {
        id: 'unfair-advantage-goal',
        name: "Trouver mon 'unfair advantage'",
        description: "Identifier et documenter mon avantage concurrentiel pour mieux orienter mes choix de carrière et projets.",
        category: 'personal',
        subCategory: 'Développement personnel',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-unfair-advantage')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-unfair-advantage')?.imageHint,
    },
    {
        id: 'achievements-goal',
        name: "Lister mes réalisations",
        description: "Créer une liste de toutes mes réalisations passées pour renforcer ma confiance et mon CV.",
        category: 'personal',
        subCategory: 'Réflexion',
        dueDate: new Date(2026, 3, 30).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-achievements')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-achievements')?.imageHint,
    },
    {
        id: 'network-goal',
        name: "Développer mon réseau",
        description: "Établir des connexions significatives avec des professionnels de mon secteur.",
        category: 'professional',
        subCategory: 'Networking',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-network')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-network')?.imageHint,
    },
    {
        id: 'cv-functional-goal',
        name: "Mettre à jour le CV fonctionnel",
        description: "Créer un CV fonctionnel mettant en avant les compétences plutôt que l'expérience chronologique.",
        category: 'professional',
        subCategory: 'Carrière',
        dueDate: new Date(2026, 4, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-cv-functional')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-cv-functional')?.imageHint,
    },
    {
        id: 'monetize-cfo-goal',
        name: "Monétiser 'The Moroccan CFO'",
        description: "Mettre en place une stratégie de monétisation pour la chaîne (partenariats, ads, etc.).",
        category: 'professional',
        subCategory: 'Création de contenu',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-monetize-cfo')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-monetize-cfo')?.imageHint,
    },
    {
        id: 'monetize-youtube-goal',
        name: "Monétiser 3 chaînes YouTube",
        description: "Avoir au moins 3 chaînes YouTube monétisées en France et aux USA d'ici fin 2026.",
        category: 'professional',
        subCategory: 'Création de contenu',
        dueDate: new Date(2026, 11, 31).toISOString(),
        imageUrl: PlaceHolderImages.find(p => p.id === 'goal-monetize-youtube')?.imageUrl,
        imageHint: PlaceHolderImages.find(p => p.id === 'goal-monetize-youtube')?.imageHint,
    }
];

const defaultProjects: Omit<Project, 'createdAt' | 'updatedAt'>[] = [];

interface DataContextType {
  isInitialized: boolean;
  shoppingList: ShoppingItem[];
  watchlist: WatchlistItem[];
  readingList: Book[];
  income: Income[];
  savingGoals: SavingGoal[];
  investments: Investment[];
  notes: Note[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  habits: Habit[];
  affirmations: Affirmation[];
  reflectionPillars: ReflectionPillar[];
  projects: Project[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const seedingRef = useRef(false);

  const { data: shoppingList, isLoading: loadingShopping } = useCollection<ShoppingItem>(
    user ? `users/${user.uid}/shopping-list` : null
  );
  const { data: watchlist, isLoading: loadingWatchlist } = useCollection<WatchlistItem>(
    user ? `users/${user.uid}/watchlist` : null
  );
  const { data: readingList, isLoading: loadingReading } = useCollection<Book>(
    user ? `users/${user.uid}/reading-list` : null
  );
  const { data: income, isLoading: loadingIncome } = useCollection<Income>(
    user ? `users/${user.uid}/income` : null
  );
  const { data: savingGoals, isLoading: loadingSavingGoals } = useCollection<SavingGoal>(
    user ? `users/${user.uid}/saving-goals` : null
  );
  const { data: investments, isLoading: loadingInvestments } = useCollection<Investment>(
    user ? `users/${user.uid}/investments` : null
  );
  const { data: notes, isLoading: loadingNotes } = useCollection<Note>(
    user ? `users/${user.uid}/notes` : null
  );
  const { data: goals, isLoading: loadingGoals } = useCollection<Goal>(
    user ? `users/${user.uid}/goals` : null
  );
  const { data: calendarEvents, isLoading: loadingCalendarEvents } = useCollection<CalendarEvent>(
    user ? `users/${user.uid}/calendar-events` : null
  );
  const { data: habits, isLoading: loadingHabits } = useCollection<Habit>(
    user ? `users/${user.uid}/habits` : null
  );
  const { data: affirmations, isLoading: loadingAffirmations } = useCollection<Affirmation>(
    user ? `users/${user.uid}/affirmations` : null
  );
  const { data: reflectionPillars, isLoading: loadingReflectionPillars } = useCollection<ReflectionPillar>(
    user ? `users/${user.uid}/reflection-pillars` : null
  );
  const { data: projects, isLoading: loadingProjects } = useCollection<Project>(
    user ? `users/${user.uid}/projects` : null
  );
  
  const isInitialized = !loadingShopping && !loadingWatchlist && !loadingReading && !loadingIncome && !loadingSavingGoals && !loadingInvestments && !loadingNotes && !loadingGoals && !loadingCalendarEvents && !loadingHabits && !loadingAffirmations && !loadingProjects;

  useEffect(() => {
    if (!isInitialized || !user || !firestore || seedingRef.current) return;
    seedingRef.current = true;

    const now = new Date().toISOString();

    const seedData = async () => {
      try {
        await runTransaction(firestore, async (transaction) => {
          // Seed Habits
          for (const habit of defaultDailyHabits) {
            const habitRef = doc(firestore, 'users', user.uid, 'habits', habit.id);
            const docSnap = await transaction.get(habitRef);
            if (!docSnap.exists()) {
              transaction.set(habitRef, { ...habit, progress: 0, createdAt: now, updatedAt: now });
            }
          }
          // Seed Pillars
          for (const pillar of defaultPillars) {
            const pillarRef = doc(firestore, 'users', user.uid, 'reflection-pillars', pillar.id);
            const docSnap = await transaction.get(pillarRef);
            if (!docSnap.exists()) {
              transaction.set(pillarRef, { ...pillar, createdAt: now, updatedAt: now });
            }
          }
          // Seed Goals
          for (const goal of defaultGoals) {
            const goalRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
            const docSnap = await transaction.get(goalRef);
            if (!docSnap.exists()) {
              transaction.set(goalRef, { ...goal, progress: goal.id === 'fmva-goal' ? 5 : 0, createdAt: now, updatedAt: now });
            }
          }
          // Seed Projects
          for (const project of defaultProjects) {
            const projectRef = doc(firestore, 'users', user.uid, 'projects', project.id);
            const docSnap = await transaction.get(projectRef);
            if (!docSnap.exists()) {
              transaction.set(projectRef, { ...project, createdAt: now, updatedAt: now });
            }
          }
        });
      } catch (e) {
        console.error("Data seeding transaction failed: ", e);
      }
    };
    
    seedData();

  }, [isInitialized, user, firestore]);

  const value: DataContextType = {
    isInitialized,
    shoppingList: shoppingList || [],
    watchlist: watchlist || [],
    readingList: readingList || [],
    income: income || [],
    savingGoals: savingGoals || [],
    investments: investments || [],
    notes: notes || [],
    goals: goals || [],
    calendarEvents: calendarEvents || [],
    habits: habits || [],
    affirmations: affirmations || [],
    reflectionPillars: reflectionPillars || [],
    projects: projects || [],
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
