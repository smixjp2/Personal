'use client';

import { useMemo } from 'react';
import type { ShoppingItem } from '@/lib/types';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UpcomingExpense {
  item: ShoppingItem;
  dueDate: Date;
}

export function UpcomingExpensesCard({ selectedMonth }: { selectedMonth: Date }) {
  const { shoppingList, isInitialized } = useData();

  const upcomingExpenses = useMemo((): UpcomingExpense[] => {
    if (!isInitialized) return [];

    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const expenses: UpcomingExpense[] = [];

    shoppingList.forEach(item => {
      if (item.purchased) return;

      const itemCreationDate = item.createdAt ? parseISO(item.createdAt as string) : new Date(0);
      const itemDate = item.date ? parseISO(item.date) : itemCreationDate;
      const frequency = item.frequency || 'one-time';
      let dueDateInMonth: Date | null = null;

      if (frequency === 'one-time') {
        if (isWithinInterval(itemDate, { start: monthStart, end: monthEnd })) {
          dueDateInMonth = itemDate;
        }
      } else { // Recurring items
        if (itemDate <= monthEnd) { // Check if the recurrence has started
          if (frequency === 'monthly') {
            dueDateInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), itemDate.getDate());
          } else if (frequency === 'yearly' && itemDate.getMonth() === selectedMonth.getMonth()) {
            dueDateInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), itemDate.getDate());
          }
        }
      }

      if (dueDateInMonth) {
        expenses.push({ item, dueDate: dueDateInMonth });
      }
    });

    return expenses.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [shoppingList, selectedMonth, isInitialized]);

  return (
    <Card className="lg:col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Dépenses à Venir
        </CardTitle>
        <CardDescription>Dépenses non-réglées pour ce mois.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-full max-h-72 pr-4">
            {isInitialized && upcomingExpenses.length > 0 ? (
            <ul className="space-y-4">
                {upcomingExpenses.map(({ item, dueDate }) => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{dueDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    {item.price && (
                    <span className="font-mono font-medium">{formatCurrency(item.price)} MAD</span>
                    )}
                </li>
                ))}
            </ul>
            ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>{isInitialized ? "Aucune dépense à venir pour ce mois." : "Chargement..."}</p>
            </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
