'use client';

import { useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Flag, Bell, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, isFuture, isToday, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';

const eventTypeConfig = {
    task: { icon: CalendarCheck, color: 'text-blue-500' },
    deadline: { icon: Flag, color: 'text-red-500' },
    reminder: { icon: Bell, color: 'text-yellow-500' },
};

export function UpcomingEvents() {
  const { calendarEvents, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const upcomingEvents = useMemo(() => {
    if (!isInitialized) return [];
    
    const today = startOfDay(new Date());

    return calendarEvents
      .filter(event => (isFuture(new Date(event.date)) || isToday(new Date(event.date))) && !event.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Limit to 5 upcoming events
  }, [isInitialized, calendarEvents]);

  const toggleEventCompletion = async (event: CalendarEvent) => {
    if (!user || !firestore) return;
    try {
      await updateDoc(doc(firestore, "users", user.uid, "calendar-events", event.id), { 
          completed: !event.completed,
          updatedAt: new Date().toISOString()
      });
      toast({ title: `Tâche ${!event.completed ? 'complétée' : 'marquée non complétée'}.` });
    } catch(error: any) {
      toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
    }
  };

  if (!isInitialized) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Événements à Venir
        </CardTitle>
        <CardDescription>
          Vos prochains rendez-vous et tâches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
            <ul className="space-y-4">
                {upcomingEvents.map(event => {
                    const EventIcon = eventTypeConfig[event.type].icon;
                    return (
                        <li key={event.id} className="flex items-center gap-4">
                            <div className="flex-grow flex items-center gap-3">
                                {event.type === 'task' && (
                                    <Checkbox
                                        id={`event-check-${event.id}`}
                                        checked={event.completed}
                                        onCheckedChange={() => toggleEventCompletion(event)}
                                    />
                                )}
                                {!event.completed && event.type !== 'task' && <EventIcon className={cn("h-5 w-5", eventTypeConfig[event.type].color)} />}
                                {event.completed && event.type !== 'task' && <Check className="h-5 w-5 text-green-500" />}
                                
                                <div>
                                    <p className={cn("font-medium", event.completed && "line-through text-muted-foreground")}>{event.title}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {format(new Date(event.date), 'EEEE d MMMM', {locale: fr})}
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>Aucun événement à venir.</p>
                <p className="text-sm">Votre calendrier est libre !</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
