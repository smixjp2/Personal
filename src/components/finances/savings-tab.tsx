
"use client";

import { useData } from "@/contexts/data-context";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc } from "firebase/firestore";
import type { SavingGoal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddSavingGoalDialog } from "./add-saving-goal-dialog";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function SavingsTab() {
  const { savingGoals, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addSavingGoal = async (newSavingGoalData: Omit<SavingGoal, "id" | "currentAmount">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    const newSavingGoal: SavingGoal = {
      ...newSavingGoalData,
      id: uuidv4(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(firestore, "users", user.uid, "saving-goals", newSavingGoal.id), newSavingGoal);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Objectifs d'Épargne</CardTitle>
          <CardDescription>Suivez la progression de votre épargne.</CardDescription>
        </div>
        <AddSavingGoalDialog onAddSavingGoal={addSavingGoal} />
      </CardHeader>
      <CardContent>
        {isInitialized && savingGoals.length > 0 ? (
          <div className="space-y-6">
            {savingGoals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between mb-1">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(goal.currentAmount)} MAD / {formatCurrency(goal.targetAmount)} MAD</p>
                  </div>
                  <Progress value={progress} />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-24 text-center flex items-center justify-center">
            {isInitialized ? "Aucun objectif d'épargne." : "Chargement..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
