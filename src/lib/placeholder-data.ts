import type { Habit, Goal, Task } from "./types";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  Dumbbell,
  Heart,
  Leaf,
  PenTool,
  Repeat,
  Target,
  TrendingUp,
  Wind,
} from "lucide-react";

export const tasks: Task[] = [
  { id: "task-1", title: "Outline Chapter 1 of new course", completed: true, dueDate: "2024-08-15" },
  { id: "task-2", title: "Research competitors for Project Phoenix", completed: false, dueDate: "2024-08-16" },
  { id: "task-3", title: "Meditate for 10 minutes", completed: true, dueDate: "2024-08-15" },
  { id: "task-4", title: "Draft initial design mockups", completed: false, dueDate: "2024-08-18" },
  { id: "task-5", title: "Schedule team sync for next week", completed: false, dueDate: "2024-08-17" },
  { id: "task-6", title: "Complete lesson 3 of React course", completed: true, dueDate: "2024-08-14" },
];

export const goals: Goal[] = [
  {
    id: "goal-1",
    name: "Launch Project Phoenix",
    description: "Successfully launch the new marketing analytics platform.",
    category: "professional",
    dueDate: "2024-12-31",
    progress: 45,
    tasks: [tasks[1], tasks[3], tasks[4]],
  },
  {
    id: "goal-2",
    name: "Complete Advanced React Course",
    description: "Finish the online course on advanced React patterns and concepts.",
    category: "course",
    dueDate: "2024-10-30",
    progress: 80,
    tasks: [tasks[0], tasks[5]],
  },
  {
    id: "goal-3",
    name: "Improve Physical Fitness",
    description: "Establish a consistent workout and healthy eating routine.",
    category: "personal",
    dueDate: "2024-12-31",
    progress: 60,
    tasks: [tasks[2]],
  },
];

export const habits: Habit[] = [
  { id: "habit-1", name: "Daily Meditation", frequency: "daily", progress: 1, goal: 1, icon: Wind },
  { id: "habit-2", name: "Workout 3x a week", frequency: "daily", progress: 0, goal: 1, icon: Dumbbell },
  { id: "habit-3", name: "Read 10 pages", frequency: "daily", progress: 1, goal: 1, icon: BookOpen },
  { id: "habit-4", name: "Drink 8 glasses of water", frequency: "daily", progress: 0, goal: 1, icon: Leaf },
  { id: "habit-5", name: "Review Weekly Goals", frequency: "monthly", progress: 75, goal: 4, icon: Repeat },
  { id: "habit-6", name: "Publish One Article", frequency: "monthly", progress: 50, goal: 1, icon: PenTool },
  { id: "habit-7", name: "Annual Performance Review Prep", frequency: "yearly", progress: 20, goal: 1, icon: TrendingUp },
  { id: "habit-8", name: "Plan Vacation", frequency: "yearly", progress: 80, goal: 1, icon: Heart },
];
