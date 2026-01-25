"use client";

import { useState, useEffect } from "react";
import type { Habit } from "@/lib/types";
import { AddHabitDialog } from "./add-habit-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { iconMap } from "./habit-icons";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const q = query(collection(db, "habits"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData: Habit[] = [];
      querySnapshot.forEach((doc) => {
        habitsData.push({ id: doc.id, ...doc.data() } as Habit);
      });
      setHabits(habitsData);
      setIsLoading(false);
    }, () => {
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addHabit = async (newHabit: Omit<Habit, "id" | "progress">) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await addDoc(collection(db, "habits"), {
        ...newHabit,
        progress: 0,
      });
    } catch (error) {
      console.error("Error adding habit: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible d'ajouter l'habitude. Veuillez réessayer.",
      });
    }
  };

  const toggleDailyHabit = async (id: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    const habitRef = doc(db, "habits", id);
    const habitToToggle = habits.find(h => h.id === id);
    if (habitToToggle) {
        try {
            await updateDoc(habitRef, { progress: habitToToggle.progress === 1 ? 0 : 1 });
        } catch (error) {
            console.error("Error toggling habit: ", error);
            toast({
                variant: "destructive",
                title: "Oh non ! Quelque chose s'est mal passé.",
                description: "Impossible de mettre à jour l'habitude. Veuillez réessayer.",
            });
        }
    }
  };

  const deleteHabit = async (id: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, "habits", id));
    } catch (error) {
      console.error("Error deleting habit: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible de supprimer l'habitude. Veuillez réessayer.",
      });
    }
  };
  
  const renderHabits = (frequency: "daily" | "monthly" | "yearly") => {
    const filteredHabits = habits.filter((h) => h.frequency === frequency);
    
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        )
    }

    if (filteredHabits.length === 0) {
      return <p className="text-muted-foreground p-8 text-center">No {frequency} habits yet. Add one to get started!</p>
    }

    return (
      <ul className="space-y-3">
        <AnimatePresence>
        {filteredHabits.map((habit, index) => {
          const Icon = iconMap[habit.icon];
          return (
          <motion.li
            key={habit.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{habit.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {habit.frequency === "daily" ? (
                  <Checkbox
                    id={`habit-check-${habit.id}`}
                    checked={habit.progress === 1}
                    onCheckedChange={() => toggleDailyHabit(habit.id)}
                  />
                ) : (
                  <div className="w-32 flex items-center gap-2">
                    <Progress value={habit.progress} className="h-2" />
                    <span className="text-xs font-mono text-muted-foreground">{habit.progress}%</span>
                  </div>
                )}
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                    onClick={() => deleteHabit(habit.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete habit</span>
                </Button>
              </div>
            </div>
          </motion.li>
        )})}
        </AnimatePresence>
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Habit Tracker</CardTitle>
        <AddHabitDialog onAddHabit={addHabit} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4">
            {renderHabits("daily")}
          </TabsContent>
          <TabsContent value="monthly" className="mt-4">
            {renderHabits("monthly")}
          </TabsContent>
          <TabsContent value="yearly" className="mt-4">
            {renderHabits("yearly")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
