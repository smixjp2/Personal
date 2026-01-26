"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryTab } from "./summary-tab";
import { IncomeTab } from "./income-tab";
import { SavingsTab } from "./savings-tab";
import { InvestmentsTab } from "./investments-tab";

export function FinanceDashboard() {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Résumé</TabsTrigger>
        <TabsTrigger value="income">Revenus</TabsTrigger>
        <TabsTrigger value="savings">Épargne</TabsTrigger>
        <TabsTrigger value="investments">Investissements</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <SummaryTab />
      </TabsContent>
      <TabsContent value="income">
        <IncomeTab />
      </TabsContent>
      <TabsContent value="savings">
        <SavingsTab />
      </TabsContent>
      <TabsContent value="investments">
        <InvestmentsTab />
      </TabsContent>
    </Tabs>
  );
}
