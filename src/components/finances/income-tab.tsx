"use client";

import { useData } from "@/contexts/data-context";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import type { Income } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddIncomeDialog } from "./add-income-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { EditIncomeDialog } from "./edit-income-dialog";

const frequencyTranslations = {
  "one-time": "Unique",
  "monthly": "Mensuel",
  "yearly": "Annuel"
}

export function IncomeTab({ selectedMonth }: { selectedMonth: Date }) {
  const { income, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const monthlyIncome = useMemo(() => {
    if (!isInitialized) return [];

    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    return income.filter(i => {
      const incomeDate = parseISO(i.date);
      if (i.frequency === 'one-time') {
        return isWithinInterval(incomeDate, { start: monthStart, end: monthEnd });
      }
      
      if (incomeDate > monthEnd) {
        return false;
      }

      if (i.frequency === 'monthly') {
        return true;
      }

      if (i.frequency === 'yearly') {
        return incomeDate.getMonth() === selectedMonth.getMonth();
      }

      return false;
    });
  }, [income, selectedMonth, isInitialized]);

  const addIncome = async (newIncomeData: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
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

  const editIncome = async (incomeId: string, updatedData: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    try {
        await updateDoc(doc(firestore, "users", user.uid, "income", incomeId), { ...updatedData, updatedAt: new Date().toISOString()});
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  const deleteIncome = async (incomeId: string) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    try {
        await deleteDoc(doc(firestore, "users", user.uid, "income", incomeId));
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
            Gardez une trace de toutes vos sources de revenus pour le mois sélectionné.
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isInitialized && monthlyIncome.length > 0 ? (
              monthlyIncome.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.amount)} MAD</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{frequencyTranslations[item.frequency]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <EditIncomeDialog income={item} onEditIncome={(updatedData) => editIncome(item.id, updatedData)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditIncomeDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteIncome(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {isInitialized ? "Aucun revenu enregistré pour ce mois." : "Chargement..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
