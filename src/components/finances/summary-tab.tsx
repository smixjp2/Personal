"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData } from "@/contexts/data-context";
import { BarChart, LineChart } from "lucide-react";

export function SummaryTab() {
  const { isInitialized, income, shoppingList, savingGoals, investments } = useData();

  // Basic calculations, can be improved later
  const totalIncome = income.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = shoppingList.filter(i => i.purchased).reduce((acc, i) => acc + (i.price || 0), 0);
  const totalSavings = savingGoals.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalInvestments = investments.reduce((acc, i) => acc + (i.currentValue || i.initialAmount), 0);
  const netWorth = totalIncome - totalExpenses + totalSavings + totalInvestments;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé Financier</CardTitle>
        <CardDescription>Un aperçu de votre santé financière.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Revenus (Total)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalIncome.toFixed(2)}€</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dépenses (Acheté)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalExpenses.toFixed(2)}€</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Épargne Totale</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{totalSavings.toFixed(2)}€</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Valeur Nette Estimée</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{netWorth.toFixed(2)}€</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Flux de trésorerie</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    <BarChart className="w-16 h-16"/>
                    <p className="ml-4">Graphique des flux de trésorerie à venir.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Évolution de la valeur nette</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    <LineChart className="w-16 h-16"/>
                     <p className="ml-4">Graphique de la valeur nette à venir.</p>
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
