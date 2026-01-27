"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Income } from "@/lib/types";

const incomeSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  amount: z.coerce.number().positive("Le montant doit être positif."),
  day: z.string().min(1, "Jour requis").max(2),
  month: z.string().min(1, "Mois requis").max(2),
  year: z.string().min(4, "Année requise").max(4),
  frequency: z.enum(["one-time", "monthly", "yearly"]),
}).refine((data) => {
    const day = parseInt(data.day, 10);
    const month = parseInt(data.month, 10);
    const year = parseInt(data.year, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, {
    message: "Date invalide.",
    path: ["day"],
  });

type FormValues = Omit<Income, "id" | "createdAt" | "updatedAt">;

type EditIncomeDialogProps = {
  income: Income;
  onEditIncome: (values: FormValues) => void;
  children: React.ReactNode;
};

export function EditIncomeDialog({ income, onEditIncome, children }: EditIncomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const incomeDate = new Date(income.date);

  const form = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      day: incomeDate.getDate().toString(),
      month: (incomeDate.getMonth() + 1).toString(),
      year: incomeDate.getFullYear().toString(),
    },
  });

  function onSubmit(values: z.infer<typeof incomeSchema>) {
    const { day, month, year, ...rest } = values;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
    onEditIncome({ ...rest, date });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le Revenu</DialogTitle>
          <DialogDescription>Mettez à jour les informations de ce revenu.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Source du revenu</FormLabel>
                <FormControl><Input placeholder="ex: Salaire, Vente freelance..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Montant</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="1500.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormItem>
              <FormLabel>Date</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="day" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Jour" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="month" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Mois" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Année" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormMessage>{form.formState.errors.day?.message}</FormMessage>
            </FormItem>
            <FormField control={form.control} name="frequency" render={({ field }) => (
                <FormItem>
                    <FormLabel>Fréquence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="one-time">Unique</SelectItem>
                            <SelectItem value="monthly">Mensuel</SelectItem>
                            <SelectItem value="yearly">Annuel</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
