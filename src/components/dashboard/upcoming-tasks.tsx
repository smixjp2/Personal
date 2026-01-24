import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import { tasks } from "@/lib/placeholder-data";
import Link from "next/link";
import { Button } from "../ui/button";

export function UpcomingTasks() {
  const today = new Date().toDateString();
  const upcomingTasks = tasks.filter(
    (task) => new Date(task.dueDate).toDateString() === today
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
        <CardDescription>What you should focus on today.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <TaskList tasks={upcomingTasks} />
      </CardContent>
      <div className="p-4 border-t">
         <Button variant="ghost" className="w-full" asChild>
            <Link href="/tasks">View All Tasks</Link>
        </Button>
      </div>
    </Card>
  );
}
