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
  addMonths,
  format,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UpcomingExpense {
  item: ShoppingItem;
  dueDate: Date;
}

export function UpcomingExpensesCard({ selectedMonth }: { selectedMonth: Date }) {
  const { shoppingList, isInitialized } = useData();

  const { upcomingExpenses, nextMonthName } = useMemo(() => {
    if (!isInitialized) return { upcomingExpenses: [], nextMonthName: '' };

    const nextMonth = addMonths(selectedMonth, 1);
    const monthStart = startOfMonth(nextMonth);
    const monthEnd = endOfMonth(nextMonth);
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
            dueDateInMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), itemDate.getDate());
          } else if (frequency === 'yearly' && itemDate.getMonth() === nextMonth.getMonth()) {
            dueDateInMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), itemDate.getDate());
          }
        }
      }

      if (dueDateInMonth) {
        expenses.push({ item, dueDate: dueDateInMonth });
      }
    });

    return {
      upcomingExpenses: expenses.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
      nextMonthName: format(nextMonth, 'MMMM', { locale: fr }),
    };
  }, [shoppingList, selectedMonth, isInitialized]);

  return (
    <Card className="lg:col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Dépenses du Mois Suivant
        </CardTitle>
        <CardDescription>Dépenses prévues pour {nextMonthName}.</CardDescription>
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
                <p>{isInitialized ? `Aucune dépense à venir pour ${nextMonthName}.` : "Chargement..."}</p>
            </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
