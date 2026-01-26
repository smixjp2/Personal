"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { WatchlistItem } from "@/lib/types";

const watchlistItemSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères."),
  category: z.enum(["movie", "tv-show"]),
  season: z.coerce.number().optional(),
  episode: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof watchlistItemSchema>;

type EditWatchlistItemDialogProps = {
  item: WatchlistItem;
  onEditItem: (values: FormValues) => void;
  children: React.ReactNode;
};

export function EditWatchlistItemDialog({ item, onEditItem, children }: EditWatchlistItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(watchlistItemSchema),
    defaultValues: {
      title: item.title,
      category: item.category,
      season: item.season || undefined,
      episode: item.episode || undefined,
    },
  });

  const category = form.watch("category");

  function onSubmit(values: FormValues) {
    onEditItem(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'élément</DialogTitle>
          <DialogDescription>Mettez à jour les détails de ce film ou de cette série.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="movie">Film</SelectItem>
                    <SelectItem value="tv-show">Série TV</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {category === 'tv-show' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saison</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="episode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Épisode</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
