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

// Weekly Review
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
  activeHabits: z.array(WeeklyReviewHabitSchema).describe('List of habits tracked in the last 7 days with their progress.'),
  goals: z.array(WeeklyReviewGoalSchema).describe('List of all active goals and their current progress.'),
  projects: z.array(WeeklyReviewProjectSchema).describe('List of all projects and their current status.'),
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
