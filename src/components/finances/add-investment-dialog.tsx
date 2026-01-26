"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import type { Investment } from "@/lib/types";
import { cn } from "@/lib/utils";

const investmentSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  type: z.string().min(2, "Le type est requis."),
  initialAmount: z.coerce.number().positive("Le montant doit être positif."),
  purchaseDate: z.date({ required_error: "La date est requise." }),
  currentValue: z.coerce.number().positive("La valeur doit être positive.").optional(),
});

type AddInvestmentDialogProps = {
  onAddInvestment: (item: Omit<Investment, "id">) => void;
};

export function AddInvestmentDialog({ onAddInvestment }: AddInvestmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
  });

  function onSubmit(values: z.infer<typeof investmentSchema>) {
    onAddInvestment({ ...values, purchaseDate: values.purchaseDate.toISOString() });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un Investissement</DialogTitle>
          <DialogDescription>Enregistrez un nouvel actif dans votre portefeuille.</DialogDescription>
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
                <FormLabel>Valeur Actuelle (Optionnel)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="1200.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                    <FormLabel className="mb-1.5">Date d'achat</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Choisir une date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
