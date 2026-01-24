"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Task } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const priorityStyles = {
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  
  const toggleTask = async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
        completed: !task.completed
    });
  };
  
  if (tasks.length === 0) {
      return <p className="text-muted-foreground p-8 text-center">No tasks here. Enjoy your free time!</p>
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTask(task)}
            />
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "flex-grow text-sm font-medium",
                task.completed && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </label>
            {task.priority && (
              <Badge variant="outline" className={cn(priorityStyles[task.priority])}>
                {task.priority}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground w-24 text-right">
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
