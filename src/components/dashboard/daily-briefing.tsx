'use client';

import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Target, Wallet, Sun } from 'lucide-react';
import { format, isToday, parseISO, startOfMonth, endOfMonth, isWithinInterval, getDaysInMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export function DailyBriefing() {
  const { isInitialized, tasks, goals, shoppingList, income } = useData();

  const today = new Date();

  const todaysTasks = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)));
  const activeGoals = goals.filter(g => g.progress < 100);

  const monthlyBalance = useMemo(() => {
    if (!isInitialized) return 0;
    
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Calculate income for the current month
    let totalIncome = 0;
    income.forEach(i => {
        const incomeDate = parseISO(i.date);
        if (i.frequency === 'one-time') {
            if (isWithinInterval(incomeDate, { start: monthStart, end: monthEnd })) {
                totalIncome += i.amount;
            }
        } else if (i.frequency === 'monthly') {
            if (incomeDate <= monthEnd) {
                totalIncome += i.amount;
            }
        } else if (i.frequency === 'yearly') {
            if (incomeDate <= monthEnd && incomeDate.getMonth() === currentMonth.getMonth()) {
                totalIncome += i.amount;
            }
        }
    });

    // Calculate expenses for the current month
    let totalExpenses = 0;
    shoppingList.forEach((item) => {
      if (!item.price) return;
      const freq = item.frequency || "one-time";
      const effectiveDate = item.date ? parseISO(item.date) : (item.createdAt ? parseISO(item.createdAt as string) : new Date(0));

      if (freq === 'one-time') {
        if (isWithinInterval(effectiveDate, { start: monthStart, end: monthEnd })) {
            totalExpenses += item.price;
        }
      } else {
        if (effectiveDate <= monthEnd) { 
            if (freq === 'daily') {
                totalExpenses += item.price * getDaysInMonth(currentMonth);
            } else if (freq === 'monthly') {
                totalExpenses += item.price;
            } else if (freq === 'yearly') {
                if (effectiveDate.getMonth() === currentMonth.getMonth()) {
                    totalExpenses += item.price;
                }
            }
        }
      }
    });

    return totalIncome - totalExpenses;
  }, [isInitialized, income, shoppingList]);

  if (!isInitialized) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-yellow-500" />
          Votre Briefing Quotidien
        </CardTitle>
        <CardDescription>
          {format(today, "EEEE d MMMM yyyy", { locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-lg"><ListTodo className="h-5 w-5 text-primary" /> Tâches du Jour</h3>
              {todaysTasks.length > 0 ? (
                <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                  {todaysTasks.map(task => <li key={task.id}>{task.title}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground pl-2">Aucune tâche pour aujourd'hui. Bravo !</p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> Objectifs Actifs</h3>
               {activeGoals.length > 0 ? (
                <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                  {activeGoals.slice(0, 3).map(goal => <li key={goal.id}>{goal.name} ({goal.progress}%)</li>)}
                   {activeGoals.length > 3 && <li className="font-medium">et {activeGoals.length - 3} autre(s)...</li>}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground pl-2">Aucun objectif en cours.</p>
              )}
            </div>
            
            <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-green-500" /> Solde du Mois</h3>
                <p className="text-2xl font-bold">{formatCurrency(monthlyBalance)} MAD</p>
               <p className="text-sm text-muted-foreground">Revenus moins dépenses pour le mois en cours.</p>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
