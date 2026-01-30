import type { IconName } from "@/components/habits/habit-icons";
import { FieldValue } from "firebase/firestore";
import { z } from "zod";

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
  category: "personal" | "professional";
  subCategory?: string;
  dueDate: string;
  progress: number;
};

export type Project = BaseEntity & {
  name: string;
  description: string;
  channel?: "The Morroccan Analyst" | "The Morroccan CFO" | "Course";
  status: "idea" | "scripting" | "recording" | "editing" | "published";
  dueDate?: string;
  objectives?: string[];
  ideas?: string[];
  links?: { title: string; url: string }[];
};


export type Task = BaseEntity & {
  title: string;
  completed: boolean;
  dueDate: string;
  priority?: "low" | "medium" | "high";
  goalId?: string;
  projectId?: string;
};

export type ShoppingItem = BaseEntity & {
  name: string;
  price?: number;
  purchased: boolean;
  purchasedAt?: string;
  category: "groceries" | "subscription" | "entertainment" | "utilities" | "shopping" | "transport" | "health" | "education" | "restaurant" | "personal_care" | "gifts" | "other";
  frequency?: "one-time" | "daily" | "monthly" | "yearly";
  date?: string;
};

export type WatchlistItem = BaseEntity & {
  title: string;
  category: "movie" | "tv-show";
  watched: boolean;
  currentlyWatching?: boolean;
  season?: number;
  episode?: number;
};

export type Book = BaseEntity & {
  title: string;
  author?: string;
  read: boolean;
  currentlyReading?: boolean;
};

export type Income = BaseEntity & {
  name: string;
  amount: number;
  date: string;
  frequency: "one-time" | "monthly" | "yearly";
};

export type SavingGoal = BaseEntity & {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
};

export type Investment = BaseEntity & {
  name: string;
  type: string;
  ticker?: string;
  initialAmount: number;
  currentValue?: number;
  purchaseDate: string;
};

export type Note = BaseEntity & {
  content: string;
};

export type { IconName };


// AI Flow Types

// Task Generation
export const GenerateTasksInputSchema = z.object({
  projectDescription: z.string().describe('The description of the project for which tasks need to be generated.'),
  projectType: z.string().describe('The type of project (e.g., course, personal, professional).'),
  desiredNumberOfTasks: z.number().describe('The desired number of tasks to generate.'),
});
export type GenerateTasksInput = z.infer<typeof GenerateTasksInputSchema>;

export const GenerateTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('An array of tasks generated for the project.'),
});
export type GenerateTasksOutput = z.infer<typeof GenerateTasksOutputSchema>;


// Task Prioritization
export const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      deadline: z.string().optional().describe('The deadline for the task (ISO format).'),
    })
  ).describe('A list of tasks to prioritize.'),
  goals: z.array(z.string()).describe('A list of active goals.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

export const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      priority: z.enum(["low", "medium", "high"]).describe('The priority of the task (low, medium, or high).'),
      reason: z.string().describe('The reasoning behind the assigned priority.'),
    })
  ).describe('A list of tasks with assigned priorities and reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;


// Weekly Review
const WeeklyReviewTaskSchema = z.object({
  title: z.string(),
  completed: z.boolean(),
});

const WeeklyReviewHabitSchema = z.object({
  name: z.string(),
  progress: z.number(), // Assuming 1 is complete for daily, or % for others
  frequency: z.string(),
});

const WeeklyReviewGoalSchema = z.object({
  name: z.string(),
  progress: z.number(),
});

const WeeklyReviewProjectSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const WeeklyReviewInputSchema = z.object({
  completedTasks: z.array(WeeklyReviewTaskSchema).describe('List of tasks completed in the last 7 days.'),
  activeHabits: z.array(WeeklyReviewHabitSchema).describe('List of habits tracked in the last 7 days with their progress.'),
  goals: z.array(WeeklyReviewGoalSchema).describe('List of all active goals and their current progress.'),
  projects: z.array(WeeklyReviewProjectSchema).describe('List of all projects and their current status.'),
  upcomingTasks: z.array(WeeklyReviewTaskSchema).describe('List of tasks due in the next 7 days.'),
});
export type WeeklyReviewInput = z.infer<typeof WeeklyReviewInputSchema>;

export const WeeklyReviewOutputSchema = z.object({
  title: z.string().describe("A catchy and encouraging title for the weekly review, like 'Votre Bilan Hebdomadaire !'"),
  summary: z.string().describe('A brief, encouraging paragraph summarizing the week. Highlight a key achievement.'),
  accomplishments: z.array(z.string()).describe('A bulleted list of the most important accomplishments of the week.'),
  suggestions: z.array(z.string()).describe('A bulleted list of actionable suggestions for the upcoming week based on goals, projects, and upcoming tasks.'),
});
export type WeeklyReviewOutput = z.infer<typeof WeeklyReviewOutputSchema>;


// AI Flow for Investment Update
export const InvestmentSchemaForAI = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  ticker: z.string().optional(),
  initialAmount: z.number(),
  currentValue: z.number().optional(),
  purchaseDate: z.string(),
});

export const UpdateInvestmentPricesInputSchema = z.object({
    investments: z.array(InvestmentSchemaForAI).describe('A list of the user\'s current investments.')
});
export type UpdateInvestmentPricesInput = z.infer<typeof UpdateInvestmentPricesInputSchema>;

export const UpdateInvestmentPricesOutputSchema = z.object({
    investments: z.array(InvestmentSchemaForAI).describe('The full list of investments with `currentValue` updated for stocks based on the latest market data.')
});
export type UpdateInvestmentPricesOutput = z.infer<typeof UpdateInvestmentPricesOutputSchema>;
