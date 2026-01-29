"use client";

import type { Project, Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar, Pencil, Plus, ListTodo, CheckSquare, Lightbulb, Link as LinkIcon, Trash2 } from "lucide-react";
import { AITaskGeneratorProject } from "./ai-task-generator-project";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, writeBatch, deleteField, arrayUnion, arrayRemove } from "firebase/firestore";
import { EditProjectDialog } from "./edit-project-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export function ProjectDetail({ project }: { project: Project }) {
  const { tasks } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id).sort((a,b) => (a.createdAt > b.createdAt) ? 1 : -1), [tasks, project.id]);

  const progress = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter((t) => t.completed).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, [projectTasks]);

  const handleUpdateArrayField = async (field: 'objectives' | 'ideas' | 'links', value: any, action: 'add' | 'remove') => {
      if (!user || !firestore) {
          toast({ variant: "destructive", title: "Erreur d'authentification" });
          return;
      }
      if (action === 'add' && !value) return;

      const projectRef = doc(firestore, "users", user.uid, "projects", project.id);
      try {
          await updateDoc(projectRef, {
              [field]: action === 'add' ? arrayUnion(value) : arrayRemove(value),
              updatedAt: new Date().toISOString()
          });

          if (action === 'add') {
              if (field === 'objectives') setNewObjective("");
              if (field === 'ideas') setNewIdea("");
              if (field === 'links') setNewLink({ title: "", url: "" });
          }
      } catch (error: any) {
          toast({ variant: "destructive", title: "Erreur Firebase", description: error.message });
      }
  };

  const onTasksGenerated = async (newTasks: string[]) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add tasks." });
      return;
    }
    const batch = writeBatch(firestore);
    const deadline = project.dueDate || new Date().toISOString();
    newTasks.forEach(title => {
        const newTaskId = uuidv4();
        const taskRef = doc(firestore, "users", user.uid, "tasks", newTaskId);
        const newTask: Task = {
            id: newTaskId,
            title,
            completed: false,
            dueDate: deadline,
            projectId: project.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        batch.set(taskRef, newTask);
    });

    try {
        await batch.commit();
        toast({ title: "Tâches générées par l'IA", description: `${newTasks.length} tâches ajoutées au projet.` });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save generated tasks." });
    }
  };

  const handleAddTask = async () => {
    if (!user || !firestore || !newTaskTitle.trim()) {
        return;
    }
    const title = newTaskTitle.trim();
    setNewTaskTitle("");

    const newTaskId = uuidv4();
    const taskRef = doc(firestore, "users", user.uid, "tasks", newTaskId);
    const newTask: Task = {
        id: newTaskId,
        title,
        completed: false,
        dueDate: project.dueDate || new Date().toISOString(),
        projectId: project.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    try {
        await writeBatch(firestore).set(taskRef, newTask).commit();
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new task." });
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user || !firestore) return;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), { 
            completed: !task.completed,
            updatedAt: new Date().toISOString() 
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update task." });
    }
  };

  const updateStatus = async (status: Project['status']) => {
    if (!user || !firestore) return;
     try {
        await updateDoc(doc(firestore, "users", user.uid, "projects", project.id), { 
            status: status,
            updatedAt: new Date().toISOString() 
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update project status." });
    }
  };

  const editProject = async (updatedData: { name: string; description: string; dueDate?: string }) => {
    if (!user || !firestore) return;
    const projectRef = doc(firestore, "users", user.uid, "projects", project.id);
    const dataToUpdate: any = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
    };
    if (updatedData.dueDate === undefined) {
        dataToUpdate.dueDate = deleteField();
    }
    try {
        await updateDoc(projectRef, dataToUpdate);
        toast({ title: "Projet mis à jour", description: "Les détails du projet ont été sauvegardés." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update project." });
    }
  };


  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-3xl font-headline flex-1">{project.name}</CardTitle>
            <div className="flex items-center gap-2">
                <Select onValueChange={updateStatus} value={project.status}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="idea">Idée</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                </Select>
                <EditProjectDialog project={project} onEditProject={editProject}>
                    <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier le projet</span>
                    </Button>
                </EditProjectDialog>
            </div>
        </div>
        <CardDescription className="pt-2 text-base">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview"><ListTodo className="mr-2 h-4 w-4" />Aperçu</TabsTrigger>
              <TabsTrigger value="objectives"><CheckSquare className="mr-2 h-4 w-4" />Objectifs</TabsTrigger>
              <TabsTrigger value="ideas"><Lightbulb className="mr-2 h-4 w-4" />Idées</TabsTrigger>
              <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4" />Liens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="space-y-4">
                {project.dueDate && (
                    <div className="flex items-center text-md text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Échéance: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Progression</p>
                      <p className="text-sm font-bold text-primary">{progress}%</p>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Tâches du projet</h3>
                  <div className="flex w-full items-center space-x-2">
                      <Input 
                          type="text" 
                          placeholder="Ajouter une nouvelle tâche..." 
                          value={newTaskTitle} 
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <Button onClick={handleAddTask}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
                  </div>
                  <AITaskGeneratorProject onTasksGenerated={onTasksGenerated} project={project} />
              
                  {projectTasks.length > 0 ? (
                  <ul className="space-y-2 pt-2">
                      <AnimatePresence>
                          {projectTasks.map((task) => (
                          <motion.li
                              key={task.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                          >
                              <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(task)}
                              />
                              <label
                              htmlFor={`task-${task.id}`}
                              className={`flex-grow cursor-pointer ${
                                  task.completed ? "text-muted-foreground line-through" : ""
                              }`}
                              >
                              {task.title}
                              </label>
                          </motion.li>
                          ))}
                      </AnimatePresence>
                  </ul>
                  ) : (
                      <p className="text-center text-muted-foreground pt-4">Aucune tâche pour ce projet. Ajoutez-en une !</p>
                  )}
              </div>
          </TabsContent>
          
          <TabsContent value="objectives" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Objectifs du Projet</h3>
              <div className="flex items-center space-x-2">
                  <Input placeholder="Ajouter un objectif..." value={newObjective} onChange={(e) => setNewObjective(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('objectives', newObjective, 'add')} />
                  <Button onClick={() => handleUpdateArrayField('objectives', newObjective, 'add')} disabled={!newObjective.trim()}>Ajouter</Button>
              </div>
              <ul className="space-y-2 pt-2">
                  {(project.objectives && project.objectives.length > 0) ? (
                    project.objectives.map((obj, index) => (
                      <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50">
                          <span className="flex-1">{obj}</span>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleUpdateArrayField('objectives', obj, 'remove')}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground pt-4">Aucun objectif défini pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>

          <TabsContent value="ideas" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Idées à Explorer</h3>
              <div className="flex items-center space-x-2">
                  <Input placeholder="Noter une nouvelle idée..." value={newIdea} onChange={(e) => setNewIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('ideas', newIdea, 'add')} />
                  <Button onClick={() => handleUpdateArrayField('ideas', newIdea, 'add')} disabled={!newIdea.trim()}>Ajouter</Button>
              </div>
              <ul className="space-y-2 pt-2">
                  {(project.ideas && project.ideas.length > 0) ? (
                    project.ideas.map((idea, index) => (
                      <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50">
                          <span className="flex-1">{idea}</span>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleUpdateArrayField('ideas', idea, 'remove')}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground pt-4">Aucune idée enregistrée pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>

          <TabsContent value="links" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Liens Utiles</h3>
              <div className="space-y-2 rounded-lg border p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="link-title" className="text-sm font-medium">Titre</label>
                      <Input id="link-title" placeholder="Ex: Documentation" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="link-url" className="text-sm font-medium">URL</label>
                      <Input id="link-url" placeholder="https://..." value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={() => handleUpdateArrayField('links', newLink, 'add')} disabled={!newLink.title.trim() || !newLink.url.trim()} className="w-full sm:w-auto mt-2">Ajouter le lien</Button>
              </div>
              <ul className="space-y-2 pt-2">
                  {(project.links && project.links.length > 0) ? (
                    project.links.map((link, index) => (
                      <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 flex-1 break-all">
                            <LinkIcon className="h-4 w-4 flex-shrink-0" />
                            {link.title}
                          </a>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleUpdateArrayField('links', link, 'remove')}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground pt-4">Aucun lien enregistré pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
