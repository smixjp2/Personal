'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddEventDialog } from './add-event-dialog';
import type { CalendarEvent } from '@/lib/types';
import { isSameDay, parseISO } from 'date-fns';
import { Checkbox } from '../ui/checkbox';

const eventTypeConfig = {
    task: { label: 'Tâche', color: 'bg-blue-500' },
    deadline: { label: 'Deadline', color: 'bg-red-500' },
    reminder: { label: 'Rappel', color: 'bg-yellow-500' },
};

export function CalendarView() {
    const { calendarEvents, isInitialized } = useData();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsAddDialogOpen(true);
    };
    
    const addEvent = async (newEventData: Omit<CalendarEvent, "id" | "completed">) => {
        if (!user || !firestore) {
            toast({ variant: "destructive", title: "Erreur d'authentification" });
            return;
        }
        const newEvent: CalendarEvent = {
            ...newEventData,
            id: uuidv4(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        try {
            await setDoc(doc(firestore, "users", user.uid, "calendar-events", newEvent.id), newEvent);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
        }
    };
    
    const toggleEventCompletion = async (event: CalendarEvent) => {
      if (!user || !firestore) return;
      try {
        await updateDoc(doc(firestore, "users", user.uid, "calendar-events", event.id), { 
            completed: !event.completed,
            updatedAt: new Date().toISOString()
        });
      } catch(error: any) {
        toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
      }
    };

    const eventsForSelectedDay = useMemo(() => {
        if (!selectedDate) return [];
        return calendarEvents.filter(event => isSameDay(parseISO(event.date), selectedDate));
    }, [calendarEvents, selectedDate]);

    const EventDay = ({ date, children }: { date: Date, children: React.ReactNode}) => {
        const eventsOnDay = calendarEvents.filter(e => isSameDay(parseISO(e.date), date));
        return (
            <div className="relative">
                {children}
                {eventsOnDay.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {eventsOnDay.slice(0, 3).map(event => (
                           <div key={event.id} className={`h-1.5 w-1.5 rounded-full ${eventTypeConfig[event.type].color}`}></div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    const DayContent = (props: any) => {
        return <EventDay date={props.date}>{props.date.getDate()}</EventDay>;
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    {/* View switcher can be added here later */}
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        onDayClick={handleDayClick}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        className="p-0"
                        classNames={{
                            day_cell: "h-16 w-full text-center",
                            day: "h-16 w-full",
                        }}
                        components={{
                            DayContent: DayContent,
                        }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedDate ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long'}) : 'Aucun jour sélectionné'}
                    </CardTitle>
                    <CardDescription>Événements du jour</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {eventsForSelectedDay.length > 0 ? (
                        eventsForSelectedDay.map(event => (
                            <div key={event.id} className="flex items-center gap-4 p-2 rounded-md bg-muted/50">
                                {event.type === 'task' && (
                                    <Checkbox 
                                        checked={event.completed}
                                        onCheckedChange={() => toggleEventCompletion(event)}
                                    />
                                )}
                                <div className="flex-grow">
                                    <p className={`font-medium ${event.completed ? 'line-through text-muted-foreground' : ''}`}>{event.title}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">{eventTypeConfig[event.type].label}</Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">Aucun événement pour ce jour.</p>
                    )}
                </CardContent>
            </Card>
            {selectedDate && <AddEventDialog isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} date={selectedDate} onAddEvent={addEvent} />}
        </div>
    );
}
