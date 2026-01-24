import type { IconName } from "@/components/habits/habit-icons";

export type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "monthly" | "yearly";
  progress: number; // 0-100 for monthly/yearly, 0 or 1 for daily
  goal: number;
  icon: IconName;
};

export type Goal = {
  id: string;
  name: string;
  description: string;
  category: "personal" | "professional" | "course";
  dueDate: string;
  progress: number; // 0-100
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority?: "low" | "medium" | "high";
  goalId?: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  price?: number;
  purchased: boolean;
};

export type WatchlistItem = {
  id: string;
  title: string;
  category: "movie" | "tv-show";
  watched: boolean;
};

export type Book = {
  id: string;
  title: string;
  author?: string;
  read: boolean;
};
