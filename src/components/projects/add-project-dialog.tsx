
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
import { useState } from "react";
import type { Project } from "@/lib/types";

const projectSchema = z.object({
  name: z.string().min(3, "Le nom du projet doit comporter au moins 3 caractères."),
  description: z.string().min(10, "La description est trop courte.").max(500, "La description est trop longue."),
  dueDay: z.string().max(2).optional(),
  dueMonth: z.string().max(2).optional(),
  dueYear: z.string().max(4).optional(),
}).refine((data) => {
    const { dueDay, dueMonth, dueYear } = data;
    if (!dueDay && !dueMonth && !dueYear) {
      return true; // All optional, so valid if all are empty
    }
    if (dueDay && dueMonth && dueYear && dueDay.length > 0 && dueMonth.length > 0 && dueYear.length === 4) {
      const day = parseInt(dueDay, 10);
      const month = parseInt(dueMonth, 10);
      const year = parseInt(dueYear, 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date >= startOfDay(new Date());
    }
    return false; // Invalid partial date
  }, {
    message: "Date invalide, passée ou incomplète.",
    path: ["dueDay"],
  });

type AddProjectDialogProps = {
  children: React.ReactNode;
  onAddProject: (project: Omit<Project, 'id' | 'status'>) => void;
};

export function AddProjectDialog({ children, onAddProject }: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof projectSchema>) {
    const { dueDay, dueMonth, dueYear, ...rest } = values;
    const dueDate = (dueDay && dueMonth && dueYear)
        ? new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay)).toISOString()
        : undefined;

    onAddProject({ ...rest, dueDate });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Décrivez votre projet. Il sera ajouté à la colonne "Idées de Contenu".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du Projet</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Vidéo sur l'analyse technique" {...field} />
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
                    <Textarea placeholder="Décrivez le sujet de la vidéo, les points clés à aborder et le public cible." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Échéance (Optionnel)</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="dueDay" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Jour" {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueMonth" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Mois" {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueYear" render={({ field }) => (
                  <FormItem>
                    <FormControl><Input placeholder="Année" {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormMessage>{form.formState.errors.dueDay?.message}</FormMessage>
            </FormItem>
            <DialogFooter className="pt-4">
              <Button type="submit">Créer le Projet</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
