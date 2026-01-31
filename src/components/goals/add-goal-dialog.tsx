"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { startOfDay } from "date-fns";
import React from 'react';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { Goal } from "@/lib/types";

const goalSchema = z.object({
  name: z.string().min(3, "Le nom de l'objectif doit être d'au moins 3 caractères."),
  description: z.string().min(10, "La description est trop courte.").max(200, "La description est trop longue."),
  category: z.enum(["personal", "professional"]),
  subCategory: z.string().optional(),
  dueDay: z.string().min(1, "Le jour est requis.").max(2, "Jour invalide."),
  dueMonth: z.string().min(1, "Le mois est requis.").max(2, "Mois invalide."),
}).refine((data) => {
    const year = 2026;
    const day = parseInt(data.dueDay, 10);
    const month = parseInt(data.dueMonth, 10);
    if (isNaN(day) || isNaN(month)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }, {
    message: "La date est invalide.",
    path: ["dueDay"],
  });


type AddGoalDialogProps = {
  children: React.ReactNode;
  onAddGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
  defaultCategory?: 'personal' | 'professional';
};

export function AddGoalDialog({ children, onAddGoal, defaultCategory }: AddGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      category: defaultCategory || "personal",
    },
  });

  React.useEffect(() => {
    if (defaultCategory) {
        form.reset({
            name: "",
            description: "",
            category: defaultCategory,
        });
    }
  }, [defaultCategory, form, isOpen]);

  function onSubmit(values: z.infer<typeof goalSchema>) {
    const { dueDay, dueMonth, ...rest } = values;
    const dueDate = new Date(2026, parseInt(dueMonth) - 1, parseInt(dueDay)).toISOString();
    onAddGoal({ ...rest, dueDate });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel Objectif pour 2026</DialogTitle>
          <DialogDescription>
            Définissez un objectif à atteindre en 2026.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'objectif</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Apprendre une nouvelle langue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Décrivez ce que le succès signifie pour cet objectif." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!defaultCategory}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      <SelectItem value="personal">Personnel</SelectItem>
                      <SelectItem value="professional">Professionnel</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sous-catégorie (Optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Carrière, Santé, Finances..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Échéance en 2026</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="dueDay" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Jour" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueMonth" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Mois" {...field} /></FormControl>
                  </FormItem>
                )} />
                 <FormItem>
                    <FormControl><Input placeholder="Année" value="2026" disabled /></FormControl>
                  </FormItem>
              </div>
              <FormMessage>{form.formState.errors.dueDay?.message}</FormMessage>
            </FormItem>

            <DialogFooter className="pt-4">
              <Button type="submit">Créer l'Objectif</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
