'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { isSameDay, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Task } from '@/lib/types';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { tasks, isInitialized } = useData();

  const selectedDayTasks = useMemo(() => {
    if (!date || !tasks) return [];
    return tasks
      .filter(task => isSameDay(parseISO(task.dueDate), date))
      .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [date, tasks]);

  const eventDays = useMemo(() => {
    if (!tasks) return [];
    const daysWithEvents = new Set<string>();
    tasks.forEach(task => {
        daysWithEvents.add(format(parseISO(task.dueDate), 'yyyy-MM-dd'));
    });
    // Need to parse back to Date objects for the matcher
    return Array.from(daysWithEvents).map(dayStr => {
        const [year, month, day] = dayStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    });
  }, [tasks]);

  const modifiers = {
    event: eventDays,
  };

  const modifiersStyles = {
    event: {
      // Using a box-shadow to create an underline effect that doesn't interfere with selection
      boxShadow: 'inset 0 -2px 0 0 hsl(var(--primary))',
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier</CardTitle>
        <CardDescription>Vos tâches en un coup d'œil. Les jours avec des tâches sont soulignés.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center border rounded-lg p-2">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                locale={fr}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
            />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">
                {date ? format(date, 'EEEE d MMMM', { locale: fr }) : "Sélectionnez une date"}
            </h3>
            <Separator />
            <ScrollArea className="h-[350px] pr-4">
            {!isInitialized 
              ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
              )
              : selectedDayTasks.length > 0 ? (
                 <div className="space-y-3">
                    {selectedDayTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-background/50 hover:bg-accent/50 transition-colors">
                        <CheckCircle2 className={cn("h-4 w-4 mt-1 shrink-0", task.completed ? "text-primary" : "text-muted-foreground/50")} />
                        <div className='flex-1'>
                        <p className={cn("font-medium leading-tight", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(task.dueDate), 'HH:mm')}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <p>Aucune tâche pour ce jour.</p>
                </div>
              )
            }
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
