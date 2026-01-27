
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useData } from "@/contexts/data-context";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  parseISO,
  getDaysInMonth,
} from "date-fns";
import { fr } from "date-fns/locale";

const cashFlowChartConfig = {
  income: {
    label: "Revenus",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Dépenses",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const netWorthChartConfig = {
  netWorth: {
    label: "Valeur Nette",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SummaryTab({ selectedMonth }: { selectedMonth: Date }) {
  const { isInitialized, income, shoppingList, savingGoals, investments } = useData();

  const calculateMonthlyExpenses = (month: Date): number => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    let total = 0;

    shoppingList.forEach((item) => {
      if (!item.price) return;
      const freq = item.frequency || "one-time";
      const effectiveDate = item.date ? parseISO(item.date) : (item.createdAt ? parseISO(item.createdAt as string) : new Date(0));

      if (freq === 'one-time') {
        if (isWithinInterval(effectiveDate, { start: monthStart, end: monthEnd })) {
            total += item.price;
        }
      } else {
        // Recurring item
        if (effectiveDate <= monthEnd) { // Must have started
            if (freq === 'daily') {
                total += item.price * getDaysInMonth(month);
            } else if (freq === 'monthly') {
                total += item.price;
            } else if (freq === 'yearly') {
                if (effectiveDate.getMonth() === month.getMonth()) {
                    total += item.price;
                }
            }
        }
      }
    });
    return total;
  };

  const calculateMonthlyIncome = (month: Date): number => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      let total = 0;

      income.forEach(i => {
          const incomeDate = parseISO(i.date);
          if (i.frequency === 'one-time') {
              if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
                  total += i.amount;
              }
          } else if (i.frequency === 'monthly') {
              if (incomeDate <= monthEnd) {
                  total += i.amount;
              }
          } else if (i.frequency === 'yearly') {
              if (incomeDate <= monthEnd && incomeDate.getMonth() === month.getMonth()) {
                  total += i.amount;
              }
          }
      });
      return total;
  };

  const monthlyIncome = useMemo(() => calculateMonthlyIncome(selectedMonth), [income, selectedMonth, isInitialized]);
  const monthlyExpenses = useMemo(() => calculateMonthlyExpenses(selectedMonth), [shoppingList, selectedMonth, isInitialized]);
  const totalSavings = savingGoals.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalInvestments = investments.reduce((acc, i) => acc + (i.currentValue || i.initialAmount), 0);
  const netWorth = totalSavings + totalInvestments;

  const cashFlowData = useMemo(() => {
    if (!isInitialized) return [];
    const futureMonths = Array.from({ length: 6 }, (_, i) => addMonths(selectedMonth, i));
    return futureMonths.map((month) => ({
      name: format(month, "MMM yy", { locale: fr }),
      income: calculateMonthlyIncome(month),
      expenses: calculateMonthlyExpenses(month),
    }));
  }, [isInitialized, income, shoppingList, selectedMonth]);

  const netWorthData = useMemo(() => {
    if (!isInitialized) return [];
    
    const data = [];
    let runningWorth = netWorth;
    const futureMonths = Array.from({ length: 6 }, (_, i) => addMonths(selectedMonth, i));

    for (let i = 0; i < futureMonths.length; i++) {
        const month = futureMonths[i];
        const monthName = format(month, "MMM yy", { locale: fr });
        
        if (i > 0) {
            const prevMonth = futureMonths[i-1];
            const incomeThisMonth = calculateMonthlyIncome(prevMonth);
            const expensesThisMonth = calculateMonthlyExpenses(prevMonth);
            runningWorth += (incomeThisMonth - expensesThisMonth);
        }
        
        data.push({ name: monthName, netWorth: i === 0 ? netWorth : runningWorth });
    }
    return data;
  }, [isInitialized, netWorth, income, shoppingList, selectedMonth]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé Financier</CardTitle>
        <CardDescription>Un aperçu de votre santé financière pour {format(selectedMonth, 'MMMM yyyy', { locale: fr })}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Revenus (Mois)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyIncome)} MAD</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dépenses (Mois)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyExpenses)} MAD</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Épargne Totale</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totalSavings)} MAD</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Valeur Nette Estimée</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(netWorth)} MAD</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Flux de trésorerie futurs</CardTitle>
                    <CardDescription>Projection des revenus et dépenses pour les 6 prochains mois.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartContainer config={cashFlowChartConfig} className="h-full w-full">
                    <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value)}`} />
                      <Tooltip content={<ChartTooltipContent formatter={(value) => `${formatCurrency(value as number)} MAD`} />} />
                      <Legend />
                      <Bar dataKey="income" name="Revenus" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Dépenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Évolution de la valeur nette</CardTitle>
                    <CardDescription>Projection de la croissance de votre valeur nette sur 6 mois.</CardDescription>
                </CardHeader>
                 <CardContent className="h-80">
                  <ChartContainer config={netWorthChartConfig} className="h-full w-full">
                    <LineChart data={netWorthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value)}`} />
                      <Tooltip content={<ChartTooltipContent formatter={(value) => `${formatCurrency(value as number)} MAD`} />} />
                      <Legend />
                      <Line type="monotone" dataKey="netWorth" name="Valeur Nette" stroke="var(--color-netWorth)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}
