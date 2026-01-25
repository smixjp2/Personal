import type { IconName } from "@/components/habits/habit-icons";
import { FieldValue } from "firebase/firestore";

type BaseEntity = {
  id: string;
  createdAt?: string | FieldValue;
  updatedAt?: string | FieldValue;
};

export type Habit = BaseEntity & {
  name: string;
  frequency: "daily" | "monthly" | "yearly";
  progress: number;
  goal: number;
  icon: IconName;
};

export type Goal = BaseEntity & {
  name: string;
  description: string;
  category: "personal" | "professional" | "course";
  dueDate: string;
  progress: number;
};

export type Task = BaseEntity & {
  title: string;
  completed: boolean;
  dueDate: string;
  priority?: "low" | "medium" | "high";
  goalId?: string;
};

export type ShoppingItem = BaseEntity & {
  name: string;
  price?: number;
  purchased: boolean;
};

export type WatchlistItem = BaseEntity & {
  title: string;
  category: "movie" | "tv-show";
  watched: boolean;
};

export type Book = BaseEntity & {
  title: string;
  author?: string;
  read: boolean;
};
