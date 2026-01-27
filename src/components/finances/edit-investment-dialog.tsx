"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Investment } from "@/lib/types";

const investmentSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  type: z.string().min(2, "Le type est requis."),
  initialAmount: z.coerce.number().positive("Le montant doit être positif."),
  currentValue: z.preprocess(
    (val) => (String(val).trim() === "" ? undefined : val),
    z.coerce.number().positive("La valeur doit être positive.").optional()
  ),
  day: z.string().min(1, "Jour requis").max(2),
  month: z.string().min(1, "Mois requis").max(2),
  year: z.string().min(4, "Année requise").max(4),
}).refine((data) => {
    const day = parseInt(data.day, 10);
    const month = parseInt(data.month, 10);
    const year = parseInt(data.year, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, {
    message: "Date d'achat invalide.",
    path: ["day"],
  });

type FormValues = Omit<z.infer<typeof investmentSchema>, 'day'|'month'|'year'> & { purchaseDate: string };

type EditInvestmentDialogProps = {
  investment: Investment;
  onEditInvestment: (values: FormValues) => void;
  children: React.ReactNode;
};

export function EditInvestmentDialog({ investment, onEditInvestment, children }: EditInvestmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const investmentDate = new Date(investment.purchaseDate);

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment.name,
      type: investment.type,
      initialAmount: investment.initialAmount,
      currentValue: investment.currentValue,
      day: investmentDate.getDate().toString(),
      month: (investmentDate.getMonth() + 1).toString(),
      year: investmentDate.getFullYear().toString(),
    },
  });

  function onSubmit(values: z.infer<typeof investmentSchema>) {
    const { day, month, year, ...rest } = values;
    const purchaseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
    onEditInvestment({ ...rest, purchaseDate });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'Investissement</DialogTitle>
          <DialogDescription>Mettez à jour les informations de cet actif.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="ex: Action Apple, ETF S&P 500" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl><Input placeholder="ex: Actions, Crypto, Immobilier" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="initialAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Montant Initial</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="1000.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="currentValue" render={({ field }) => (
              <FormItem>
                <FormLabel>Valeur Actuelle</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="1200.00" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormItem>
              <FormLabel>Date d'achat</FormLabel>
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
            <DialogFooter className="pt-4">
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
