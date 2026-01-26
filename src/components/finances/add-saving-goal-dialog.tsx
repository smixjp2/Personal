"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { SavingGoal } from "@/lib/types";

const savingGoalSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  targetAmount: z.coerce.number().positive("Le montant doit être positif."),
});

type AddSavingGoalDialogProps = {
  onAddSavingGoal: (item: Omit<SavingGoal, "id" | "currentAmount">) => void;
};

export function AddSavingGoalDialog({ onAddSavingGoal }: AddSavingGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof savingGoalSchema>>({
    resolver: zodResolver(savingGoalSchema),
  });

  function onSubmit(values: z.infer<typeof savingGoalSchema>) {
    onAddSavingGoal(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nouvel Objectif</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel Objectif d'Épargne</DialogTitle>
          <DialogDescription>Définissez votre prochain objectif financier.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'objectif</FormLabel>
                <FormControl><Input placeholder="ex: Fonds d'urgence, Voyage..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Montant Cible</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="5000.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit">Créer l'objectif</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
