"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryTab } from "./summary-tab";
import { IncomeTab } from "./income-tab";
import { SavingsTab } from "./savings-tab";
import { InvestmentsTab } from "./investments-tab";
import { ShoppingList } from "@/components/shopping/shopping-list";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

export function FinanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  return (
    <>
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth} aria-label="Mois précédent">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold w-48 text-center capitalize">
          {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Mois suivant">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Résumé</TabsTrigger>
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="income">Revenus</TabsTrigger>
          <TabsTrigger value="savings">Épargne</TabsTrigger>
          <TabsTrigger value="investments">Investissements</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>
        <TabsContent value="expenses">
          <ShoppingList selectedMonth={selectedMonth} />
        </TabsContent>
        <TabsContent value="income">
          <IncomeTab selectedMonth={selectedMonth} />
        </TabsContent>
        <TabsContent value="savings">
          <SavingsTab />
        </TabsContent>
        <TabsContent value="investments">
          <InvestmentsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}