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
import type { SavingGoal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const updateSchema = z.object({
  amount: z.coerce.number(),
});

type ManageSavingGoalDialogProps = {
  goal: SavingGoal;
  onUpdateGoal: (goalId: string, newCurrentAmount: number) => void;
  children: React.ReactNode;
};

export function ManageSavingGoalDialog({ goal, onUpdateGoal, children }: ManageSavingGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
  });

  function onSubmit(values: z.infer<typeof updateSchema>) {
    const newAmount = goal.currentAmount + values.amount;
    if (newAmount < 0) {
      form.setError("amount", { type: "manual", message: "Le solde ne peut pas être négatif." });
      return;
    }
    onUpdateGoal(goal.id, newAmount);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gérer: {goal.name}</DialogTitle>
          <DialogDescription>
            Montant actuel: {formatCurrency(goal.currentAmount)} MAD / {formatCurrency(goal.targetAmount)} MAD
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Montant à ajouter/retirer</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="50.00 (ajouter) ou -20.00 (retirer)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit">Mettre à jour</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
