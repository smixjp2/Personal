"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useState, useEffect } from "react";
import type { ReflectionPillar } from "@/lib/types";

const pillarSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères."),
  description: z.string().min(10, "La description est trop courte."),
});

type ManagePillarDialogProps = {
  children: React.ReactNode;
  pillar?: ReflectionPillar;
  onSave: (values: z.infer<typeof pillarSchema>) => void;
};

export function ManagePillarDialog({ children, pillar, onSave }: ManagePillarDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof pillarSchema>>({
    resolver: zodResolver(pillarSchema),
  });

  useEffect(() => {
    if (isOpen) {
        form.reset(pillar || { title: "", description: "" });
    }
  }, [isOpen, pillar, form]);

  const isEditing = !!pillar;

  function onSubmit(values: z.infer<typeof pillarSchema>) {
    onSave(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le pilier" : "Nouveau pilier de réflexion"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Mettez à jour ce pilier stratégique." : "Ajoutez une nouvelle grande question à votre réflexion."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Mes projections dans le futur" {...field} />
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
                    <Textarea placeholder="Décrivez le sujet de ce pilier." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
