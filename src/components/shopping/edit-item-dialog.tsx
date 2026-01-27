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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { ShoppingItem } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const itemSchema = z.object({
  name: z.string().min(2, "Le nom de l'article doit comporter au moins 2 caractères."),
  price: z.preprocess(
    (val) => (String(val).trim() === "" ? undefined : val),
    z.coerce.number().positive("Le prix doit être un nombre positif.").optional()
  ),
  category: z.enum(["groceries", "subscription", "entertainment", "utilities", "shopping", "transport", "health", "education", "restaurant", "personal_care", "gifts", "other"]),
  frequency: z.enum(["one-time", "daily", "monthly", "yearly"]),
  day: z.string().max(2).optional(),
  month: z.string().max(2).optional(),
  year: z.string().max(4).optional(),
}).refine((data) => {
    const { day, month, year } = data;
    const allEmpty = !day && !month && !year;
    const allFilled = day && month && year;
    if (allEmpty) return true;
    if (allFilled) {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
        const date = new Date(y, m - 1, d);
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    }
    return false;
}, {
    message: "La date doit être complète (jour, mois, année) ou vide.",
    path: ["day"],
});


type FormValues = z.infer<typeof itemSchema>;

type EditItemDialogProps = {
  item: ShoppingItem;
  onEditItem: (values: Omit<FormValues, 'day'|'month'|'year'> & { date?: string }) => void;
  children: React.ReactNode;
};

export function EditItemDialog({ item, onEditItem, children }: EditItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemDate = item.date ? new Date(item.date) : null;
  const form = useForm<FormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item.name,
      price: item.price,
      category: item.category,
      frequency: item.frequency || "one-time",
      day: itemDate ? itemDate.getDate().toString() : undefined,
      month: itemDate ? (itemDate.getMonth() + 1).toString() : undefined,
      year: itemDate ? itemDate.getFullYear().toString() : undefined,
    },
  });

  function onSubmit(values: FormValues) {
    const { day, month, year, ...rest } = values;
    const date = (day && month && year) 
        ? new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString()
        : undefined;
    onEditItem({...rest, date });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de votre article.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'article</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Nouveau clavier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (Optionnel)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="149.99" {...field} value={field.value ?? ''} />
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
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="groceries">Courses</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                      <SelectItem value="entertainment">Divertissement</SelectItem>
                      <SelectItem value="utilities">Charges</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="health">Santé</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="personal_care">Soins personnels</SelectItem>
                      <SelectItem value="gifts">Cadeaux</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une fréquence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one-time">Ponctuel</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
              <FormLabel>Date de la Dépense (Optionnel)</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField control={form.control} name="day" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Jour" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="month" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Mois" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem><FormControl><Input placeholder="Année" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                )} />
              </div>
              <FormMessage>{form.formState.errors.day?.message}</FormMessage>
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
