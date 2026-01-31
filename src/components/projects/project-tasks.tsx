'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { ProjectTask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProjectTasks({ projectId }: { projectId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newTaskContent, setNewTaskContent] = useState('');

  const tasksPath = user ? `users/${user.uid}/projects/${projectId}/tasks` : null;
  const { data: tasks, isLoading } = useCollection<ProjectTask>(tasksPath);

  const handleAddTask = async () => {
    if (!user || !firestore || !tasksPath || !newTaskContent.trim()) {
      if (!newTaskContent.trim()) toast({ variant: 'destructive', title: 'La tâche ne peut pas être vide.' });
      return;
    }

    const taskId = uuidv4();
    const taskRef = doc(firestore, tasksPath, taskId);
    const newTask: ProjectTask = {
      id: taskId,
      content: newTaskContent.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(taskRef, newTask);
      setNewTaskContent('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder la tâche.' });
    }
  };

  const toggleTask = async (task: ProjectTask) => {
    if (!user || !firestore || !tasksPath) return;
    const taskRef = doc(firestore, tasksPath, task.id);
    try {
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour la tâche.' });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !firestore || !tasksPath) return;
    const taskRef = doc(firestore, tasksPath, taskId);
    try {
      await deleteDoc(taskRef);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la tâche.' });
    }
  };

  const sortedTasks = tasks?.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tâches du Projet</CardTitle>
        <CardDescription>Suivez les actions à réaliser pour ce projet.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nouvelle tâche..."
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button onClick={handleAddTask}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
        </div>
        <ul className="space-y-2">
            {isLoading && <p>Chargement des tâches...</p>}
            {!isLoading && tasks && tasks.length > 0 ? (
                <AnimatePresence>
                {sortedTasks?.map((task) => (
                    <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                    >
                    <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task)}
                    />
                    <label
                        htmlFor={`task-${task.id}`}
                        className={cn("flex-grow", task.completed && "line-through text-muted-foreground")}
                    >
                        {task.content}
                    </label>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </motion.li>
                ))}
                </AnimatePresence>
            ) : !isLoading && (
                <p className="text-center text-muted-foreground py-6">Aucune tâche pour ce projet.</p>
            )}
        </ul>
      </CardContent>
    </Card>
  );
}
