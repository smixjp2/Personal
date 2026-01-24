"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import type { Task } from "@/lib/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function UpcomingTasks() {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, "tasks"), 
      where("dueDate", ">=", today.toISOString().split('T')[0]),
      where("dueDate", "<", tomorrow.toISOString().split('T')[0])
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setUpcomingTasks(tasksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
        <CardDescription>What you should focus on today.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? <p>Loading tasks...</p> : <TaskList tasks={upcomingTasks} />}
      </CardContent>
      <div className="p-4 border-t">
         <Button variant="ghost" className="w-full" asChild>
            <Link href="/tasks">View All Tasks</Link>
        </Button>
      </div>
    </Card>
  );
}
