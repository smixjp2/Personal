
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { ShoppingItem, WatchlistItem, Book, Income, SavingGoal, Investment, Note, Project } from '@/lib/types';

interface DataContextType {
  isInitialized: boolean;
  shoppingList: ShoppingItem[];
  watchlist: WatchlistItem[];
  readingList: Book[];
  income: Income[];
  savingGoals: SavingGoal[];
  investments: Investment[];
  notes: Note[];
  projects: Project[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

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
  const { data: projects, isLoading: loadingProjects } = useCollection<Project>(
    user ? `users/${user.uid}/projects` : null
  );
  
  const isInitialized = !loadingShopping && !loadingWatchlist && !loadingReading && !loadingIncome && !loadingSavingGoals && !loadingInvestments && !loadingNotes && !loadingProjects;

  const value: DataContextType = {
    isInitialized,
    shoppingList: shoppingList || [],
    watchlist: watchlist || [],
    readingList: readingList || [],
    income: income || [],
    savingGoals: savingGoals || [],
    investments: investments || [],
    notes: notes || [],
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
