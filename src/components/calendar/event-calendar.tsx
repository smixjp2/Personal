"use client";

import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data-context';
import {
  addDays,
  startOfWeek,
  format,
  eachHourOfInterval,
  isSameDay,
  getDay,
  getHours,
  set,
  isToday,
  subWeeks,
  addWeeks,
  endOfWeek,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Plus, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

const LeftSidebar = ({ selectedDate, onDateChange }: { selectedDate: Date; onDateChange: (date: Date | undefined) => void; }) => (
  <aside className="w-64 p-4 flex flex-col gap-6">
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateChange}
      className="rounded-md border"
    />
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Rechercher..." className="pl-8" />
    </div>
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Mes calendriers</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox id="cal-greg" defaultChecked />
          <label htmlFor="cal-greg" className="text-sm font-medium leading-none">greg@gmail.com</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cal-acme" defaultChecked />
          <label htmlFor="cal-acme" className="text-sm font-medium leading-none">greg@acme.com</label>
        </div>
      </div>
    </div>
  </aside>
);

const WeeklyGrid = ({ currentDate }: { currentDate: Date }) => {
  const { tasks, isInitialized } = useData();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = eachHourOfInterval({
    start: set(currentDate, { hours: 8 }),
    end: set(currentDate, { hours: 20 }),
  });

  const weekTasks = useMemo(() => {
    if (!tasks) return [];
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return tasks.filter(task => isWithinInterval(parseISO(task.dueDate), { start: weekStart, end: weekEnd }));
  }, [tasks, currentDate, weekStart]);

  if (!isInitialized) {
    return <div className="grid grid-cols-[60px_repeat(7,1fr)] flex-1 overflow-auto"><Skeleton className="col-span-8 row-span-full h-full" /></div>;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] grid-rows-[auto_repeat(13,minmax(60px,1fr))] relative">
        {/* Day Headers */}
        <div />
        {days.map(day => (
          <div key={day.toString()} className="text-center p-2 border-b border-l">
            <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: fr }).toUpperCase()}</p>
            <p className={cn("text-lg font-medium", isToday(day) && "text-primary")}>{format(day, 'd')}</p>
          </div>
        ))}
        
        {/* Time Gutter and Grid Lines */}
        {hours.map((hour, index) => (
          <React.Fragment key={hour.toISOString()}>
            <div className="flex justify-end pr-2 pt-1 text-xs text-muted-foreground -mt-3">
              {format(hour, 'ha')}
            </div>
            {days.map(day => (
              <div key={day.toISOString()} className="border-l border-b" />
            ))}
          </React.Fragment>
        ))}

        {/* Event Placement */}
        {weekTasks.map(task => {
          const taskDate = parseISO(task.dueDate);
          const dayIndex = getDay(taskDate); // 0 = Sunday
          const startHour = getHours(taskDate);
          const duration = 1; // Assume 1 hour duration

          if (startHour < 8 || startHour > 20) return null;

          const gridRowStart = startHour - 8 + 2; // +2 for header row and 1-based index
          const gridColumnStart = dayIndex + 2; // +2 for time gutter and 1-based index

          return (
            <div
              key={task.id}
              className="absolute p-2 rounded-md bg-primary/10 border-l-4 border-primary text-primary-foreground overflow-hidden"
              style={{
                gridRow: `${gridRowStart} / span ${duration}`,
                gridColumn: gridColumnStart,
                top: `calc(${gridRowStart - 1} * (100% / 14) + ${format(taskDate, 'mm')}px / 60 * (100% / 14))`,
                height: `calc(${duration} * (100% / 14))`,
                left: `calc(${(gridColumnStart - 1)} * (100% / 8))`,
                width: `calc(100% / 8 - 4px)`,
                marginTop: '3.5rem', // Offset for header
                marginLeft: '2px',
                marginRight: '2px'
              }}
            >
              <p className="text-xs font-bold text-primary">{task.title}</p>
              <p className="text-xs text-primary/80">{format(taskDate, 'p')}</p>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const RightSidebar = ({ currentDate }: { currentDate: Date }) => {
  const { tasks, isInitialized } = useData();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const upcomingDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const tasksByDay = useMemo(() => {
    if (!tasks) return new Map();
    const map = new Map<string, Task[]>();
    upcomingDays.forEach(day => {
      const dayTasks = tasks.filter(task => isSameDay(parseISO(task.dueDate), day));
      if (dayTasks.length > 0) {
        map.set(day.toISOString(), dayTasks);
      }
    });
    return map;
  }, [tasks, upcomingDays]);

  return (
    <aside className="w-80 p-4 border-l">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Tâches planifiées</h3>
          {!isInitialized && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full"/>)}
          {isInitialized && tasksByDay.size === 0 && <p className="text-sm text-muted-foreground text-center pt-8">Aucune tâche pour cette semaine.</p>}
          {Array.from(tasksByDay.entries()).map(([dayISO, dayTasks]) => (
            <div key={dayISO}>
              <h4 className="font-semibold text-sm mb-2 capitalize">{format(parseISO(dayISO), 'EEEE d MMMM', { locale: fr })}</h4>
              <div className="space-y-2">
                {dayTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", task.completed ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1">
                      <p className={cn(task.completed && "line-through text-muted-foreground")}>{task.title}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(task.dueDate), 'p')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex h-[calc(100vh-var(--header-height,4rem))] bg-card">
      <LeftSidebar selectedDate={currentDate} onDateChange={handleDateChange} />
      <main className="flex-1 flex flex-col border-l border-r">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={goToToday}>Aujourd'hui</Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeek}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <h2 className="text-xl font-semibold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une tâche
          </Button>
        </header>
        <WeeklyGrid currentDate={currentDate} />
      </main>
      <RightSidebar currentDate={currentDate} />
    </div>
  );
};
