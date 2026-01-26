
"use client";

import { useData } from "@/contexts/data-context";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { doc, setDoc } from "firebase/firestore";
import type { Investment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddInvestmentDialog } from "./add-investment-dialog";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function InvestmentsTab() {
  const { investments, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suivi des Investissements</CardTitle>
          <CardDescription>
            Gardez un œil sur la performance de votre portefeuille.
          </CardDescription>
        </div>
        <AddInvestmentDialog onAddInvestment={addInvestment} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant Initial</TableHead>
              <TableHead>Valeur Actuelle</TableHead>
              <TableHead>Plus/Moins-value</TableHead>
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
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.initialAmount.toFixed(2)} MAD</TableCell>
                    <TableCell>{currentValue.toFixed(2)} MAD</TableCell>
                    <TableCell className={cn("flex items-center", isGain ? "text-green-600" : "text-red-600")}>
                      {isGain ? <ArrowUp className="h-4 w-4 mr-1"/> : <ArrowDown className="h-4 w-4 mr-1"/>}
                      {gainLoss.toFixed(2)} MAD
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
