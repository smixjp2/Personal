"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useState } from 'react';
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const projectSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères."),
  description: z.string().min(10, "La description est trop courte."),
  link: z.string().url("Le lien doit être une URL valide.").optional().or(z.literal('')),
  status: z.enum(["idea", "pre-monetization", "monetized"]),
  imageId: z.string().optional(),
});

type FormValues = z.infer<typeof projectSchema>;
type SavePayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

type ManageProjectDialogProps = {
  children: React.ReactNode;
  project?: Project;
  onSave: (values: SavePayload, projectId?: string) => void;
};

export function ManageProjectDialog({ children, project, onSave }: ManageProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const defaultValues = project ? {
        name: project.name,
        description: project.description,
        link: project.link || '',
        status: project.status,
        imageId: PlaceHolderImages.find(p => p.imageUrl === project.imageUrl)?.id || '',
      } : {
        name: "",
        description: "",
        link: "",
        status: "idea" as const,
        imageId: "",
      };
      form.reset(defaultValues);
    }
  }, [isOpen, project, form]);

  const isEditing = !!project;

  function onSubmit(values: FormValues) {
    const selectedImage = PlaceHolderImages.find(p => p.id === values.imageId);
    const payload: SavePayload = {
      name: values.name,
      description: values.description,
      link: values.link,
      status: values.status,
      imageUrl: selectedImage?.imageUrl,
      imageHint: selectedImage?.imageHint,
    };
    onSave(payload, project?.id);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le projet" : "Nouveau Projet"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Mettez à jour les informations de votre projet." : "Ajoutez un nouveau projet à votre liste."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="ex: The Moroccan Analyst" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Décrivez votre projet." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem><FormLabel>Lien (Optionnel)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="idea">Idée</SelectItem>
                    <SelectItem value="pre-monetization">En cours</SelectItem>
                    <SelectItem value="monetized">Monétisé</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="imageId" render={({ field }) => (
              <FormItem><FormLabel>Image</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une image" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucune</SelectItem>
                    <SelectItem value="project-analyst">Logo YouTube 1</SelectItem>
                    <SelectItem value="project-cfo">Logo YouTube 2</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4"><Button type="submit">Sauvegarder</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
