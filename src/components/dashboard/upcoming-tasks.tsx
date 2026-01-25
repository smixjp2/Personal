"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import Link from "next/link";
import { Button } from "../ui/button";
import { useData } from "@/contexts/data-context";

export function UpcomingTasks() {
  const { tasks, isInitialized } = useData();

  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
        <CardDescription>What you should focus on today.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {!isInitialized ? <p>Loading tasks...</p> : <TaskList tasks={upcomingTasks} />}
      </CardContent>
      <div className="p-4 border-t">
         <Button variant="ghost" className="w-full" asChild>
            <Link href="/tasks">View All Tasks</Link>
        </Button>
      </div>
    </Card>
  );
}
