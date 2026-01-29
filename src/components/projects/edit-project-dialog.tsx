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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projectSchema = z.object({
  name: z.string().min(3, "Le nom du projet doit comporter au moins 3 caractères."),
  description: z.string().min(10, "La description est trop courte.").max(500, "La description est trop longue."),
  channel: z.enum(["The Morroccan Analyst", "The Morroccan CFO", "Course"], { required_error: "Veuillez sélectionner une chaîne." }),
  dueDay: z.string().max(2).optional(),
  dueMonth: z.string().max(2).optional(),
  dueYear: z.string().max(4).optional(),
}).refine((data) => {
    const { dueDay, dueMonth, dueYear } = data;
    if (!dueDay && !dueMonth && !dueYear) {
      return true;
    }
    if (dueDay && dueMonth && dueYear && dueDay.length > 0 && dueMonth.length > 0 && dueYear.length === 4) {
      const day = parseInt(dueDay, 10);
      const month = parseInt(dueMonth, 10);
      const year = parseInt(dueYear, 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date >= startOfDay(new Date());
    }
    return false;
  }, {
    message: "Date invalide, passée ou incomplète.",
    path: ["dueDay"],
  });

type FormValues = z.infer<typeof projectSchema>;

type EditProjectDialogProps = {
  children: React.ReactNode;
  project: Project;
  onEditProject: (project: Omit<FormValues, 'dueDay' | 'dueMonth' | 'dueYear'> & { dueDate?: string }) => void;
};

export function EditProjectDialog({ children, project, onEditProject }: EditProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const projectDate = project.dueDate ? new Date(project.dueDate) : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      channel: project.channel,
      dueDay: projectDate ? projectDate.getDate().toString() : undefined,
      dueMonth: projectDate ? (projectDate.getMonth() + 1).toString() : undefined,
      dueYear: projectDate ? projectDate.getFullYear().toString() : undefined,
    },
  });

  function onSubmit(values: FormValues) {
    const { dueDay, dueMonth, dueYear, ...rest } = values;
    const dueDate = (dueDay && dueMonth && dueYear)
        ? new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay)).toISOString()
        : undefined;

    onEditProject({ ...rest, dueDate });
    form.reset(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de votre projet.
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
                    <Input placeholder="ex: Lancer un podcast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chaîne / Plateforme</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une plateforme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="The Morroccan Analyst">The Morroccan Analyst</SelectItem>
                      <SelectItem value="The Morroccan CFO">The Morroccan CFO</SelectItem>
                      <SelectItem value="Course">Formation</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="Décrivez le projet, ses objectifs et le résultat attendu." {...field} />
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
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
