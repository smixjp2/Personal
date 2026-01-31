"use client";

import type { Goal } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { Badge } from "../ui/badge";

export function GoalCard({ goal }: { goal: Goal }) {

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          {goal.name}
        </CardTitle>
        <CardDescription>{goal.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Échéance: {new Date(goal.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
          </div>
          {goal.subCategory && (
            <Badge variant="outline" className="font-normal">{goal.subCategory}</Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Progression</p>
            <p className="text-sm font-bold text-primary">{goal.progress}%</p>
          </div>
          <Progress value={goal.progress} />
        </div>
      </CardContent>
    </Card>
  );
}
