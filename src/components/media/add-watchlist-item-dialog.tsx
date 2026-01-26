"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { WatchlistItem } from "@/lib/types";

const watchlistItemSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères."),
  category: z.enum(["movie", "tv-show"]),
  season: z.coerce.number().optional(),
  episode: z.coerce.number().optional(),
});

type AddWatchlistItemDialogProps = {
  onAddItem: (item: Omit<WatchlistItem, "id" | "watched">) => void;
};

export function AddWatchlistItemDialog({ onAddItem }: AddWatchlistItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof watchlistItemSchema>>({
    resolver: zodResolver(watchlistItemSchema),
    defaultValues: {
      title: "",
      category: "movie",
    },
  });

  const category = form.watch("category");

  function onSubmit(values: z.infer<typeof watchlistItemSchema>) {
    onAddItem(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter à la liste de visionnage</DialogTitle>
          <DialogDescription>
            Quel film ou série voulez-vous voir ?
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
                    <Input placeholder="e.g. Blade Runner 2049" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="movie">Film</SelectItem>
                          <SelectItem value="tv-show">Série TV</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            {category === 'tv-show' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="season" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saison</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="episode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Épisode</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="submit">Ajouter à la liste</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
