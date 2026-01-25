
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Habit, Goal, Task, ShoppingItem, WatchlistItem, Book } from '@/lib/types';

interface DataContextType {
  isInitialized: boolean;
  habits: Habit[];
  goals: Goal[];
  tasks: Task[];
  shoppingList: ShoppingItem[];
  watchlist: WatchlistItem[];
  readingList: Book[];
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
  const { data: tasks, isLoading: loadingTasks } = useCollection<Task>(
    user ? `users/${user.uid}/tasks` : null
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
  
  const isInitialized = !loadingHabits && !loadingGoals && !loadingTasks && !loadingShopping && !loadingWatchlist && !loadingReading;

  const value: DataContextType = {
    isInitialized,
    habits: habits || [],
    goals: goals || [],
    tasks: tasks || [],
    shoppingList: shoppingList || [],
    watchlist: watchlist || [],
    readingList: readingList || [],
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
