
"use client";

import { useData } from "@/contexts/data-context";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc, updateDoc, deleteDoc, deleteField, writeBatch } from "firebase/firestore";
import type { Investment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddInvestmentDialog } from "./add-investment-dialog";
import { ArrowDown, ArrowUp, Pencil, Trash2, RefreshCw } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { EditInvestmentDialog } from "./edit-investment-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateInvestmentPrices } from "@/ai/flows/update-investments-flow";

export function InvestmentsTab() {
  const { investments, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const addInvestment = async (newInvestmentData: Omit<Investment, "id">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    const newInvestment: Investment = {
      ...newInvestmentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(firestore, "users", user.uid, "investments", newInvestment.id), newInvestment);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  const editInvestment = async (investmentId: string, updatedData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    const dataToUpdate: any = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
    };
    if (updatedData.currentValue === undefined) {
        dataToUpdate.currentValue = deleteField();
    }
    try {
      await updateDoc(doc(firestore, "users", user.uid, "investments", investmentId), dataToUpdate);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  const deleteInvestment = async (investmentId: string) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur d'authentification" });
      return;
    }
    try {
      await deleteDoc(doc(firestore, "users", user.uid, "investments", investmentId));
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  const handleAiUpdate = async () => {
    if (!user || !firestore || !investments.length) return;

    setIsUpdating(true);
    try {
      const result = await updateInvestmentPrices({ investments });

      if (result && result.investments) {
        const batch = writeBatch(firestore);
        let updatesCount = 0;

        result.investments.forEach(updatedInvestment => {
          const originalInvestment = investments.find(i => i.id === updatedInvestment.id);
          const hasChanged = originalInvestment?.currentValue !== updatedInvestment.currentValue;

          if (originalInvestment && hasChanged && updatedInvestment.currentValue !== undefined) {
            const investmentRef = doc(firestore, "users", user.uid, "investments", updatedInvestment.id);
            batch.update(investmentRef, {
              currentValue: updatedInvestment.currentValue,
              updatedAt: new Date().toISOString(),
            });
            updatesCount++;
          }
        });

        if (updatesCount > 0) {
            await batch.commit();
            toast({ title: `${updatesCount} action(s) mise(s) à jour !`, description: "Les valeurs de votre portefeuille ont été actualisées." });
        } else {
            toast({ title: "Portefeuille déjà à jour", description: "Aucune modification de valeur n'était nécessaire." });
        }
      } else {
        throw new Error("L'IA n'a pas retourné de résultat valide.");
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur IA", description: error.message || "Impossible de mettre à jour les cours pour le moment." });
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suivi des Investissements</CardTitle>
          <CardDescription>
            Gardez un œil sur la performance de votre portefeuille.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleAiUpdate} disabled={isUpdating || !isInitialized}>
                {isUpdating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Mettre à jour les cours
            </Button>
            <AddInvestmentDialog onAddInvestment={addInvestment} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant Initial</TableHead>
              <TableHead>Valeur Actuelle</TableHead>
              <TableHead>Plus/Moins-value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isInitialized && investments.length > 0 ? (
              investments.map((item) => {
                const currentValue = item.currentValue ?? item.initialAmount;
                const gainLoss = currentValue - item.initialAmount;
                const isGain = gainLoss >= 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs">{item.ticker || '-'}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{formatCurrency(item.initialAmount)} MAD</TableCell>
                    <TableCell>{formatCurrency(currentValue)} MAD</TableCell>
                    <TableCell className={cn("flex items-center", isGain ? "text-green-600" : "text-red-600")}>
                      {isGain ? <ArrowUp className="h-4 w-4 mr-1"/> : <ArrowDown className="h-4 w-4 mr-1"/>}
                      {formatCurrency(gainLoss)} MAD
                    </TableCell>
                    <TableCell className="text-right">
                      <EditInvestmentDialog investment={item} onEditInvestment={(updatedData) => editInvestment(item.id, updatedData)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </EditInvestmentDialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteInvestment(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {isInitialized ? "Aucun investissement enregistré." : "Chargement..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
