
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
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import Image from "next/image";

type GoalCardProps = {
  goal: Goal;
  onEdit: (goal: Partial<Omit<Goal, 'id'>>) => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      {goal.imageUrl && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={goal.imageUrl}
            alt={goal.name}
            fill
            className="object-cover"
            data-ai-hint={goal.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{goal.name}</CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <EditGoalDialog goal={goal} onEditGoal={onEdit}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                        </DropdownMenuItem>
                    </EditGoalDialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Supprimer</span>
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. L'objectif "{goal.name}" sera définitivement supprimé.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
