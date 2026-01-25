'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Goal, Task, Habit, Book, WatchlistItem, ShoppingItem } from '@/lib/types';

// Define the shape of your data
interface AppData {
  goals: Goal[];
  setGoals: (value: Goal[] | ((val: Goal[]) => Goal[])) => void;
  tasks: Task[];
  setTasks: (value: Task[] | ((val: Task[]) => Task[])) => void;
  habits: Habit[];
  setHabits: (value: Habit[] | ((val: Habit[]) => Habit[])) => void;
  readingList: Book[];
  setReadingList: (value: Book[] | ((val: Book[]) => Book[])) => void;
  watchlist: WatchlistItem[];
  setWatchlist: (value: WatchlistItem[] | ((val: WatchlistItem[]) => WatchlistItem[])) => void;
  shoppingList: ShoppingItem[];
  setShoppingList: (value: ShoppingItem[] | ((val: ShoppingItem[]) => ShoppingItem[])) => void;
  isInitialized: boolean;
}

// Create the context
const DataContext = createContext<AppData | undefined>(undefined);

// Create the provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals, goalsInitialized] = useLocalStorage<Goal[]>('goals', []);
  const [tasks, setTasks, tasksInitialized] = useLocalStorage<Task[]>('tasks', []);
  const [habits, setHabits, habitsInitialized] = useLocalStorage<Habit[]>('habits', []);
  const [readingList, setReadingList, readingListInitialized] = useLocalStorage<Book[]>('readingList', []);
  const [watchlist, setWatchlist, watchlistInitialized] = useLocalStorage<WatchlistItem[]>('watchlist', []);
  const [shoppingList, setShoppingList, shoppingListInitialized] = useLocalStorage<ShoppingItem[]>('shoppingList', []);
  
  // The app is initialized once all data sources have loaded from local storage
  const isInitialized = goalsInitialized && tasksInitialized && habitsInitialized && readingListInitialized && watchlistInitialized && shoppingListInitialized;

  const value = {
    goals,
    setGoals,
    tasks,
    setTasks,
    habits,
    setHabits,
    readingList,
    setReadingList,
    watchlist,
    setWatchlist,
    shoppingList,
    setShoppingList,
    isInitialized,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Create a custom hook to use the context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
