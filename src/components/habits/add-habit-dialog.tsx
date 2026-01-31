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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { Habit } from "@/lib/types";
import { iconMap, iconNames } from "./habit-icons";

const habitSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  frequency: z.enum(["daily", "monthly", "yearly"]),
  icon: z.enum(iconNames),
});

type AddHabitDialogProps = {
  onAddHabit: (habit: Omit<Habit, "id" | "progress" | "goal">) => void;
};

export function AddHabitDialog({ onAddHabit }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof habitSchema>>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      icon: "Wind",
    },
  });

  function onSubmit(values: z.infer<typeof habitSchema>) {
    onAddHabit(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une habitude
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle habitude</DialogTitle>
          <DialogDescription>
            Quelle nouvelle habitude souhaitez-vous créer ?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'habitude</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Méditer 10 minutes" {...field} />
                  </FormControl>
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
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône</FormLabel>
                  <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-8 gap-2"
                    >
                        {iconNames.map(iconName => {
                            const Icon = iconMap[iconName];
                            return (
                                <FormItem key={iconName}>
                                    <FormControl>
                                        <RadioGroupItem value={iconName} id={`add-${iconName}`} className="sr-only" />
                                    </FormControl>
                                    <FormLabel htmlFor={`add-${iconName}`}>
                                        <div className={`cursor-pointer rounded-lg border-2 p-2 flex justify-center items-center ${field.value === iconName ? 'border-primary' : ''}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                    </FormLabel>
                                </FormItem>
                            )
                        })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Ajouter l'habitude</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
