export type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "monthly" | "yearly";
  progress: number; // 0-100 for monthly/yearly, 0 or 1 for daily
  goal: number;
  icon: React.ElementType;
};

export type Goal = {
  id: string;
  name: string;
  description: string;
  category: "personal" | "professional" | "course";
  dueDate: string;
  progress: number; // 0-100
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority?: "low" | "medium" | "high";
};
