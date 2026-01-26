import { FinanceDashboard } from "@/components/finances/finance-dashboard";

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Finances</h1>
      </div>
      <FinanceDashboard />
    </div>
  );
}
