'use client';

import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Sun, Clapperboard } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, getDaysInMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export function DailyBriefing() {
  const { isInitialized, shoppingList, income, watchlist } = useData();

  const today = new Date();

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

  const currentlyWatching = useMemo(() => {
    if (!isInitialized) return null;
    return watchlist.find(item => item.currentlyWatching);
  }, [isInitialized, watchlist]);

  if (!isInitialized) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
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
        <div className="space-y-3">
           <h3 className="font-semibold flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-green-500" /> Solde du Mois</h3>
            <p className="text-3xl font-bold">{formatCurrency(monthlyBalance)} MAD</p>
           <p className="text-sm text-muted-foreground">Revenus moins dépenses pour le mois en cours.</p>
        </div>
        
        {currentlyWatching && (
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
                <Clapperboard className="h-5 w-5 text-primary" /> Visionnage en cours
            </h3>
            <div>
                <p className="text-xl font-bold">{currentlyWatching.title}</p>
                {currentlyWatching.category === 'tv-show' && (currentlyWatching.season || currentlyWatching.episode) && (
                    <p className="text-sm text-muted-foreground">
                        {currentlyWatching.season && `Saison ${currentlyWatching.season}`}
                        {currentlyWatching.season && currentlyWatching.episode && ' - '}
                        {currentlyWatching.episode && `Épisode ${currentlyWatching.episode}`}
                    </p>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
