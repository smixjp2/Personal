
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { ShoppingItem, WatchlistItem, Book, Income, SavingGoal, Investment, Note, Goal, CalendarEvent, Habit, Affirmation, ReflectionPillar, Project } from '@/lib/types';
import { doc, runTransaction } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const defaultDailyHabits: Omit<Habit, 'createdAt' | 'updatedAt'>[] = [
    { id: 'default-brush-teeth', name: 'Se brosser les dents', icon: 'Smile', frequency: 'daily', progress: 0, goal: 1 },
    { id: 'default-wash-face', name: 'Se laver le visage', icon: 'Droplets', frequency: 'daily', progress: 0, goal: 1 },
    { id: 'default-make-breakfast', name: 'Préparer le petit-déjeuner', icon: 'Apple', frequency: 'daily', progress: 0, goal: 1 },
    { id: 'default-tidy-room', name: 'Ranger la chambre', icon: 'Bed', frequency: 'daily', progress: 0, goal: 1 },
    { id: 'default-study-fmva', name: 'Étudier 30 min pour FMVA', icon: 'BookOpen', frequency: 'daily', progress: 0, goal: 1, link: 'https://learn.corporatefinanceinstitute.com/dashboard', goalId: 'static-fmva-goal' },
    { id: 'default-read-book', name: 'Lire 10 min par jour un livre', icon: 'BookOpen', frequency: 'daily', progress: 0, goal: 1, goalId: 'static-learning-goal' },
];

const defaultPillars: Omit<ReflectionPillar, 'createdAt' | 'updatedAt'>[] = [
    { id: 'default-projections', title: 'Mes projections dans le futur', description: "Où vous voyez-vous dans 1, 5, 10 ans ? Quels sont vos grands rêves ?" },
    { id: 'default-compliments', title: 'Liste des compliments', description: "Notez les compliments que les gens vous font. C'est une source de confiance et de prise de conscience de vos forces." },
    { id: 'default-market-value', title: 'Ma valeur sur le marché', description: "Combien valez-vous professionnellement ? Quelles compétences sont les plus demandées ?" },
    { id: 'default-investments', title: 'Autres moyens d\'investissement', description: "Explorez de nouvelles avenues pour faire fructifier votre capital au-delà des options actuelles." },
    { id: 'default-usa-stock', title: 'Intégrer la bourse USA', description: "Quelles sont les étapes, les plateformes et les stratégies pour investir sur le marché américain ?" },
    { id: 'default-retirement', title: 'Retraites complémentaires', description: "Quelles options de retraite existent pour compléter le système de base ?" },
];


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
  
  const isInitialized = !loadingShopping && !loadingWatchlist && !loadingReading && !loadingIncome && !loadingSavingGoals && !loadingInvestments && !loadingNotes && !loadingGoals && !loadingCalendarEvents && !loadingHabits && !loadingAffirmations && !loadingReflectionPillars && !loadingProjects;

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
              transaction.set(habitRef, { ...habit, createdAt: now, updatedAt: now });
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
