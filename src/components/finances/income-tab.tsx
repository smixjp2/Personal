"use client";

import { useData } from "@/contexts/data-context";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc } from "firebase/firestore";
import type { Income } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddIncomeDialog } from "./add-income-dialog";
import { Badge } from "@/components/ui/badge";

const frequencyTranslations = {
  "one-time": "Unique",
  "monthly": "Mensuel",
  "yearly": "Annuel"
}

export function IncomeTab() {
  const { income, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addIncome = async (newIncomeData: Omit<Income, "id">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    const newIncome: Income = {
      ...newIncomeData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(firestore, "users", user.uid, "income", newIncome.id), newIncome);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suivi des Revenus</CardTitle>
          <CardDescription>
            Gardez une trace de toutes vos sources de revenus.
          </CardDescription>
        </div>
        <AddIncomeDialog onAddIncome={addIncome} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fréquence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isInitialized && income.length > 0 ? (
              income.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.amount.toFixed(2)}€</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{frequencyTranslations[item.frequency]}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {isInitialized ? "Aucun revenu enregistré." : "Chargement..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
