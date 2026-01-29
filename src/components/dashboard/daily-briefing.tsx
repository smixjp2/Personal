'use client';

import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, Target, TrendingDown, TrendingUp, Sun } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function DailyBriefing() {
  const { isInitialized, tasks, goals, shoppingList, income } = useData();

  const today = new Date();

  const todaysTasks = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)));
  const activeGoals = goals.filter(g => g.progress < 100);
  const todaysExpenses = shoppingList.filter(item => item.date && isToday(parseISO(item.date)) && !item.purchased && item.price);
  const todaysIncome = income.filter(i => i.date && isToday(parseISO(i.date)));

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
  
  const hasContent = todaysTasks.length > 0 || activeGoals.length > 0 || todaysExpenses.length > 0 || todaysIncome.length > 0;

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
        {!hasContent ? (
          <p className="text-center text-muted-foreground py-8">Rien de spécial au programme pour aujourd'hui. Profitez-en !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
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
            
            <div className="space-y-3 md:col-span-2">
                <Separator />
            </div>

            <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-green-500" /> Revenus du Jour</h3>
               {todaysIncome.length > 0 ? (
                 <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                    {todaysIncome.map(inc => <li key={inc.id}>{inc.name}: <span className="font-medium text-foreground">{formatCurrency(inc.amount)} MAD</span></li>)}
                 </ul>
               ) : (
                 <p className="text-sm text-muted-foreground pl-2">Aucun revenu prévu aujourd'hui.</p>
               )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-lg"><TrendingDown className="h-5 w-5 text-red-500" /> Charges du Jour</h3>
              {todaysExpenses.length > 0 ? (
                 <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground pl-2">
                    {todaysExpenses.map(exp => <li key={exp.id}>{exp.name}: <span className="font-medium text-foreground">{formatCurrency(exp.price)} MAD</span></li>)}
                 </ul>
               ) : (
                 <p className="text-sm text-muted-foreground pl-2">Aucune charge prévue aujourd'hui.</p>
               )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
