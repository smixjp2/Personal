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
  name: z.string().min(2, "Name must be at least 2 characters."),
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
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Meditate for 10 minutes" {...field} />
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
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how often" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
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
                  <FormLabel>Icon</FormLabel>
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
