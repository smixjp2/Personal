import type { IconName } from "@/components/habits/habit-icons";
import { FieldValue } from "firebase/firestore";
import { z } from "zod";

type BaseEntity = {
  id: string;
  createdAt?: string | FieldValue;
  updatedAt?: string | FieldValue;
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
