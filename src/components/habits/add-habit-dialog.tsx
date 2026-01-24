"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, BookOpen, Dumbbell, Leaf, PenTool, Repeat, Wind } from "lucide-react";

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

const iconMap = {
    Wind: Wind,
    Dumbbell: Dumbbell,
    BookOpen: BookOpen,
    Leaf: Leaf,
    Repeat: Repeat,
    PenTool: PenTool
};
type IconName = keyof typeof iconMap;
const iconNames = Object.keys(iconMap) as IconName[];

const habitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  frequency: z.enum(["daily", "monthly", "yearly"]),
  icon: z.enum(iconNames),
});

type AddHabitDialogProps = {
  onAddHabit: (habit: Omit<Habit, "id" | "progress" | "goal" | "icon"> & { icon: React.ElementType }) => void;
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
    const IconComponent = iconMap[values.icon];
    onAddHabit({ ...values, icon: IconComponent, goal: 1 });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Habit</DialogTitle>
          <DialogDescription>
            What new habit do you want to build?
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
                        className="grid grid-cols-6 gap-4"
                    >
                        {iconNames.map(iconName => {
                            const Icon = iconMap[iconName];
                            return (
                                <FormItem key={iconName}>
                                    <FormControl>
                                        <RadioGroupItem value={iconName} id={iconName} className="sr-only" />
                                    </FormControl>
                                    <FormLabel htmlFor={iconName}>
                                        <div className={`cursor-pointer rounded-lg border-2 p-3 flex justify-center items-center ${field.value === iconName ? 'border-primary' : ''}`}>
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
              <Button type="submit">Add Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
