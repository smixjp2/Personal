"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, getDaysInMonth } from "date-fns";
import { fr } from "date-fns/locale";
import type { ShoppingItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const categoryTranslations = {
    groceries: "Courses",
    subscription: "Abonnement",
    entertainment: "Divertissement",
    utilities: "Charges",
    shopping: "Shopping",
    other: "Autre",
};

export function SpendingCharts({ items, selectedMonth }: { items: ShoppingItem[], selectedMonth: Date }) {
  const [monthsToShow, setMonthsToShow] = useState(6);

  const categoryData = useMemo(() => {
    const currentMonthStart = startOfMonth(selectedMonth);
    const currentMonthEnd = endOfMonth(selectedMonth);

    const byCategory: Record<string, number> = {};

    items.forEach(item => {
        if (!item.price) return;

        const freq = item.frequency || 'one-time';
        const itemStartDate = item.createdAt ? parseISO(item.createdAt as string) : new Date(0);
        
        if (itemStartDate > currentMonthEnd) return; 

        if (freq === 'one-time') {
            const dateToTest = item.date ? parseISO(item.date) : itemStartDate;
            if (isWithinInterval(dateToTest, { start: currentMonthStart, end: currentMonthEnd })) {
                byCategory[item.category] = (byCategory[item.category] || 0) + item.price;
            }
        } else if (freq === 'daily') {
            byCategory[item.category] = (byCategory[item.category] || 0) + (item.price * getDaysInMonth(selectedMonth));
        } else if (freq === 'monthly') {
            byCategory[item.category] = (byCategory[item.category] || 0) + item.price;
        } else if (freq === 'yearly') {
            if (itemStartDate.getMonth() === selectedMonth.getMonth()) {
                byCategory[item.category] = (byCategory[item.category] || 0) + item.price;
            }
        }
    });

    return Object.entries(byCategory).map(([category, total]) => ({
      name: categoryTranslations[category as keyof typeof categoryTranslations] || category,
      value: total,
    })).sort((a, b) => b.value - a.value);
  }, [items, selectedMonth]);


  const monthlyData = useMemo(() => {
    const lastXMonths = Array.from({ length: monthsToShow }, (_, i) => subMonths(selectedMonth, i)).reverse();

    return lastXMonths.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      let total = 0;

      items.forEach(item => {
        if (!item.price) return;

        const freq = item.frequency || 'one-time';
        const itemStartDate = item.createdAt ? parseISO(item.createdAt as string) : new Date(0);

        if (itemStartDate > monthEnd) return; 

        if (freq === 'one-time') {
            const dateToTest = item.date ? parseISO(item.date) : itemStartDate;
            if (isWithinInterval(dateToTest, { start: monthStart, end: monthEnd })) {
                total += item.price;
            }
        } else if (freq === 'daily') {
            total += item.price * getDaysInMonth(month);
        } else if (freq === 'monthly') {
            total += item.price;
        } else if (freq === 'yearly') {
            if (itemStartDate.getMonth() === month.getMonth()) {
                total += item.price;
            }
        }
      });

      return {
        name: format(month, "MMM yy", { locale: fr }),
        total: total,
      };
    });
  }, [items, selectedMonth, monthsToShow]);

  const chartConfigCategory = useMemo(() => {
    const config: ChartConfig = {};
    categoryData.forEach((d, i) => {
        config[d.name] = {
            label: d.name,
            color: CHART_COLORS[i % CHART_COLORS.length],
        }
    });
    return config;
  }, [categoryData]);
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
          <CardDescription>Répartition de vos achats pour le mois sélectionné.</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ChartContainer config={chartConfigCategory} className="h-64 w-full">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value) => `${formatCurrency(value as number)} MAD`} />}
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Legend content={<CustomLegend payload={categoryData.map((d,i) => ({value: d.name, color: CHART_COLORS[i % CHART_COLORS.length]}))} />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-muted-foreground">
              Aucune dépense pour ce mois.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Tendance des dépenses</CardTitle>
                <CardDescription>Évolution de vos dépenses mensuelles (en MAD).</CardDescription>
            </div>
            <Select value={String(monthsToShow)} onValueChange={(val) => setMonthsToShow(Number(val))}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-64 w-full">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} />
                <Tooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${formatCurrency(value as number)} MAD`} />} />
                <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const CustomLegend = ({ payload }: { payload?: any[] }) => {
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4 text-sm">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };