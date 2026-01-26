"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useData } from "@/contexts/data-context";
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  tasks: {
    label: "Tâches terminées",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ProgressChart() {
  const { tasks, isInitialized } = useData();

  const chartData = useMemo(() => {
    if (!isInitialized) return [];

    const today = startOfDay(new Date());
    const last7DaysInterval = {
      start: subDays(today, 6),
      end: today,
    };
    const last7Days = eachDayOfInterval(last7DaysInterval);

    return last7Days.map((day) => {
      const completedTasksOnDay = tasks.filter((task) => {
        if (
          !task.completed ||
          !task.updatedAt ||
          typeof task.updatedAt !== "string"
        )
          return false;
        const completedDate = startOfDay(new Date(task.updatedAt));
        return isSameDay(day, completedDate);
      }).length;

      return {
        day: format(day, "E"), // 'Mon', 'Tue', etc.
        tasks: completedTasksOnDay,
      };
    });
  }, [tasks, isInitialized]);

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression Hebdomadaire</CardTitle>
          <CardDescription>
            Tâches terminées au cours des 7 derniers jours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression Hebdomadaire</CardTitle>
        <CardDescription>
          Tâches terminées au cours des 7 derniers jours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              allowDecimals={false}
            />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
