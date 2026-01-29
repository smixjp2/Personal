"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { startOfDay } from "date-fns";

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
  category: z.enum(["personal", "professional", "course"]),
  subCategory: z.string().optional(),
  dueDay: z.string().min(1, "Le jour est requis.").max(2, "Jour invalide."),
  dueMonth: z.string().min(1, "Le mois est requis.").max(2, "Mois invalide."),
  dueYear: z.string().min(4, "L'année doit comporter 4 chiffres.").max(4, "L'année doit comporter 4 chiffres."),
}).refine((data) => {
    const day = parseInt(data.dueDay, 10);
    const month = parseInt(data.dueMonth, 10);
    const year = parseInt(data.dueYear, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date >= startOfDay(new Date());
  }, {
    message: "La date est invalide ou passée.",
    path: ["dueDay"],
  });


type AddGoalDialogProps = {
  children: React.ReactNode;
  onAddGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
};

export function AddGoalDialog({ children, onAddGoal }: AddGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "personal",
    },
  });

  function onSubmit(values: z.infer<typeof goalSchema>) {
    const { dueDay, dueMonth, dueYear, ...rest } = values;
    const dueDate = new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay)).toISOString();
    onAddGoal({ ...rest, dueDate });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
          <DialogDescription>
            Define your next big objective.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Run a half marathon" {...field} />
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
                    <Textarea placeholder="Describe what success looks like." {...field} />
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
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
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
                    <Input placeholder="ex: Voyage, Argent, Famille..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Due Date</FormLabel>
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
                <FormField control={form.control} name="dueYear" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Année" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormMessage>{form.formState.errors.dueDay?.message}</FormMessage>
            </FormItem>

            <DialogFooter className="pt-4">
              <Button type="submit">Create Goal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
