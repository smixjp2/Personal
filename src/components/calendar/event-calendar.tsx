"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function EventCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const eventsByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    const taskDate = new Date(task.dueDate).toDateString();
    if (!acc[taskDate]) {
      acc[taskDate] = [];
    }
    acc[taskDate].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const selectedDateString = date?.toDateString();
  const selectedDayEvents = selectedDateString
    ? eventsByDate[selectedDateString] || []
    : [];

  const eventDays = Object.keys(eventsByDate).map(dateStr => new Date(dateStr));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="flex justify-center"
            modifiers={{
                events: eventDays
            }}
            modifiersStyles={{
                events: {
                    color: 'hsl(var(--primary-foreground))',
                    backgroundColor: 'hsl(var(--primary))',
                }
            }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {date
              ? date.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Select a date"}
          </CardTitle>
          <CardDescription>Tasks scheduled for this day.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : selectedDayEvents.length > 0 ? (
            <ul className="space-y-2">
              {selectedDayEvents.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center gap-2 text-sm ${
                    task.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0"></div>
                  {task.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No tasks for this day.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
