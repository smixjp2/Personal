
"use client";

import type { Habit, IconName } from "@/lib/types";
import { AddHabitDialog } from "./add-habit-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { iconMap } from "./habit-icons";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Target } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc, deleteField } from "firebase/firestore";
import { EditHabitDialog } from "./edit-habit-dialog";

export function HabitTracker() {
  const { habits, goals, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addHabit = async (newHabitData: Omit<Habit, "id" | "progress" | "goal">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification", description: "Vous devez être connecté pour ajouter une habitude." });
      return;
    }
    const newHabit: Habit = {
      ...newHabitData,
      id: uuidv4(),
      progress: 0,
      goal: 1, // Default goal, can be customized later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(firestore, "users", user.uid, "habits", newHabit.id), newHabit);
    } catch(error: any) {
      toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Impossible de sauvegarder la nouvelle habitude." });
    }
  };

  const editHabit = async (habitId: string, updatedData: { name: string; frequency: "daily" | "monthly" | "yearly"; icon: IconName; goalId?: string; }) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    
    const dataToUpdate: any = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    if (updatedData.goalId) {
      dataToUpdate.goalId = updatedData.goalId;
    } else {
      dataToUpdate.goalId = deleteField();
    }

    try {
      await updateDoc(doc(firestore, "users", user.uid, "habits", habitId), dataToUpdate);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de mettre à jour l'habitude." });
    }
  };

  const toggleDailyHabit = async (habit: Habit) => {
    if (!user || !firestore) return;
    const newProgress = habit.progress === 1 ? 0 : 1;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "habits", habit.id), { progress: newProgress, updatedAt: new Date().toISOString() });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de mettre à jour l'habitude." });
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, "users", user.uid, "habits", id));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message || "Impossible de supprimer l'habitude." });
    }
  };
  
  const morningRoutineHabits: Habit[] = [
    {
      id: 'static-teeth-habit',
      name: 'Se brosser les dents',
      icon: 'Smile',
      frequency: 'daily',
      progress: 0,
      goal: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-face-habit',
      name: 'Se laver le visage',
      icon: 'Droplets',
      frequency: 'daily',
      progress: 0,
      goal: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-breakfast-habit',
      name: 'Préparer le petit-déjeuner',
      icon: 'Apple',
      frequency: 'daily',
      progress: 0,
      goal: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'static-room-habit',
      name: 'Ranger la chambre',
      icon: 'Bed',
      frequency: 'daily',
      progress: 0,
      goal: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const fmvaHabit: Habit = {
    id: 'static-fmva-habit',
    name: 'Étudier 30 min pour FMVA',
    icon: 'BookOpen',
    frequency: 'daily',
    progress: 0,
    goal: 1,
    link: 'https://learn.corporatefinanceinstitute.com/dashboard',
    goalId: 'static-fmva-goal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const readingHabit: Habit = {
    id: 'static-reading-habit',
    name: 'Lire 10 min par jour un livre',
    icon: 'BookOpen',
    frequency: 'daily',
    progress: 0,
    goal: 1,
    goalId: 'static-learning-goal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const renderHabits = (frequency: "daily" | "monthly" | "yearly") => {
    const baseHabits = habits.filter((h) => h.frequency === frequency);
    const filteredHabits = frequency === 'daily' ? [...morningRoutineHabits, fmvaHabit, readingHabit, ...baseHabits] : baseHabits;
    
    if (!isInitialized) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        )
    }

    if (filteredHabits.length === 0) {
      return <p className="text-muted-foreground p-8 text-center">Aucune habitude {frequency === 'daily' ? 'quotidienne' : (frequency === 'monthly' ? 'mensuelle' : 'annuelle')} pour l'instant.</p>
    }

    return (
      <ul className="space-y-3">
        <AnimatePresence>
        {filteredHabits.map((habit, index) => {
          const Icon = iconMap[habit.icon];
          const linkedGoal = habit.goalId ? goals.find(g => g.id === habit.goalId) : null;

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
                <div>
                    {habit.link ? (
                        <a href={habit.link} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                        {habit.name}
                        </a>
                    ) : (
                        <span className="font-medium">{habit.name}</span>
                    )}
                    {linkedGoal && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Target className="h-3 w-3" />
                            <span>{linkedGoal.name}</span>
                        </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {habit.frequency === "daily" ? (
                  <Checkbox
                    id={`habit-check-${habit.id}`}
                    checked={habit.progress === 1}
                    onCheckedChange={() => toggleDailyHabit(habit)}
                    disabled={habit.id.startsWith('static-')}
                  />
                ) : (
                  <div className="w-32 flex items-center gap-2">
                    <Progress value={habit.progress} className="h-2" />
                    <span className="text-xs font-mono text-muted-foreground">{habit.progress}%</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <EditHabitDialog habit={habit} onEditHabit={(values) => editHabit(habit.id, values)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" disabled={habit.id.startsWith('static-')}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier l'habitude</span>
                      </Button>
                  </EditHabitDialog>
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                      onClick={() => deleteHabit(habit.id)}
                      disabled={habit.id.startsWith('static-')}
                  >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer l'habitude</span>
                  </Button>
                 </div>
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
        <div>
          <CardTitle>Suivi des Habitudes</CardTitle>
          <CardDescription>Créez des routines et suivez vos progrès.</CardDescription>
        </div>
        <AddHabitDialog onAddHabit={addHabit} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Quotidien</TabsTrigger>
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="yearly">Annuel</TabsTrigger>
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
