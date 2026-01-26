
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Habit, Goal, Task, ShoppingItem, WatchlistItem, Book, Project, Income, SavingGoal, Investment } from '@/lib/types';

interface DataContextType {
  isInitialized: boolean;
  habits: Habit[];
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  shoppingList: ShoppingItem[];
  watchlist: WatchlistItem[];
  readingList: Book[];
  income: Income[];
  savingGoals: SavingGoal[];
  investments: Investment[];
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
  const { data: income, isLoading: loadingIncome } = useCollection<Income>(
    user ? `users/${user.uid}/income` : null
  );
  const { data: savingGoals, isLoading: loadingSavingGoals } = useCollection<SavingGoal>(
    user ? `users/${user.uid}/saving-goals` : null
  );
  const { data: investments, isLoading: loadingInvestments } = useCollection<Investment>(
    user ? `users/${user.uid}/investments` : null
  );
  
  const isInitialized = !loadingHabits && !loadingGoals && !loadingTasks && !loadingShopping && !loadingWatchlist && !loadingReading && !loadingProjects && !loadingIncome && !loadingSavingGoals && !loadingInvestments;

  const value: DataContextType = {
    isInitialized,
    habits: habits || [],
    goals: goals || [],
    projects: projects || [],
    tasks: tasks || [],
    shoppingList: shoppingList || [],
    watchlist: watchlist || [],
    readingList: readingList || [],
    income: income || [],
    savingGoals: savingGoals || [],
    investments: investments || [],
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
