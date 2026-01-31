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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { Habit, IconName } from "@/lib/types";
import { iconMap, iconNames } from "./habit-icons";

const habitSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  frequency: z.enum(["daily", "monthly", "yearly"]),
  icon: z.enum(iconNames),
});

type FormValues = z.infer<typeof habitSchema>;

type EditHabitDialogProps = {
  habit: Habit;
  onEditHabit: (values: FormValues) => void;
  children: React.ReactNode;
};

export function EditHabitDialog({ habit, onEditHabit, children }: EditHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit.name,
      frequency: habit.frequency,
      icon: habit.icon,
    },
  });

  function onSubmit(values: FormValues) {
    onEditHabit(values);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'habitude</DialogTitle>
          <DialogDescription>
            Apportez des modifications à votre habitude.
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
                                        <RadioGroupItem value={iconName} id={`edit-${iconName}`} className="sr-only" />
                                    </FormControl>
                                    <FormLabel htmlFor={`edit-${iconName}`}>
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
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
