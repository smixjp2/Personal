
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Habit, Goal, ShoppingItem, WatchlistItem, Book, Project, Income, SavingGoal, Investment, Note } from '@/lib/types';

interface DataContextType {
  isInitialized: boolean;
  habits: Habit[];
  goals: Goal[];
  projects: Project[];
  shoppingList: ShoppingItem[];
  watchlist: WatchlistItem[];
  readingList: Book[];
  income: Income[];
  savingGoals: SavingGoal[];
  investments: Investment[];
  notes: Note[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

  const { data: habits, isLoading: loadingHabits } = useCollection<Habit>(
    user ? `users/${user.uid}/habits` : null
  );
  const { data: goals, isLoading: loadingGoals } = useCollection<Goal>(
    user ? `users/${user.uid}/goals` : null
  );
  const { data: projects, isLoading: loadingProjects } = useCollection<Project>(
    user ? `users/${user.uid}/projects` : null
  );
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
  
  const isInitialized = !loadingHabits && !loadingGoals && !loadingShopping && !loadingWatchlist && !loadingReading && !loadingProjects && !loadingIncome && !loadingSavingGoals && !loadingInvestments && !loadingNotes;

  const value: DataContextType = {
    isInitialized,
    habits: habits || [],
    goals: goals || [],
    projects: projects || [],
    shoppingList: shoppingList || [],
    watchlist: watchlist || [],
    readingList: readingList || [],
    income: income || [],
    savingGoals: savingGoals || [],
    investments: investments || [],
    notes: notes || [],
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
