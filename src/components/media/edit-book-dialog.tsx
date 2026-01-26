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
import { useState } from "react";
import type { Book } from "@/lib/types";

const bookSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères."),
  author: z.string().optional(),
});

type FormValues = z.infer<typeof bookSchema>;

type EditBookDialogProps = {
  book: Book;
  onEditBook: (values: FormValues) => void;
  children: React.ReactNode;
};

export function EditBookDialog({ book, onEditBook, children }: EditBookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book.title,
      author: book.author || "",
    },
  });

  function onSubmit(values: FormValues) {
    onEditBook(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le livre</DialogTitle>
          <DialogDescription>Mettez à jour les détails de ce livre.</DialogDescription>
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
            <FormField control={form.control} name="author" render={({ field }) => (
              <FormItem>
                <FormLabel>Auteur (Optionnel)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-4">
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
