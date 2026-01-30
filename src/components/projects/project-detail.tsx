
"use client";

import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Pencil, Link as LinkIcon, Trash2, Lightbulb, FileText, Video, Scissors, CheckCircle2, Info, ListChecks, Brain, FileArchive } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, deleteField, arrayUnion, arrayRemove } from "firebase/firestore";
import { EditProjectDialog } from "./edit-project-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const channelLinks: Record<string, string> = {
  "The Morroccan Analyst": "https://www.youtube.com/channel/UCK6m2fe2txUxNFxpn65rURg",
  "The Morroccan CFO": "https://www.youtube.com/@TheMoroccanCFO",
};

const statusConfig: { [key in Project['status']]: { icon: React.ElementType; label: string } } = {
  idea: { icon: Lightbulb, label: "Idée" },
  scripting: { icon: FileText, label: "Script" },
  recording: { icon: Video, label: "Tournage" },
  editing: { icon: Scissors, label: "Montage" },
  published: { icon: CheckCircle2, label: "Publié" },
};
const statuses: Project['status'][] = ["idea", "scripting", "recording", "editing", "published"];

export function ProjectDetail({ project }: { project: Project }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [newObjective, setNewObjective] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  const channelLink = channelLinks[project.channel as keyof typeof channelLinks];

  const handleUpdateArrayField = async (field: 'objectives' | 'ideas' | 'links', value: any, action: 'add' | 'remove') => {
      if (!user || !firestore) {
          toast({ variant: "destructive", title: "Erreur d'authentification" });
          return;
      }
      if (action === 'add') {
        if (field === 'links' && (!value.title || !value.url)) return;
        if (field !== 'links' && !value) return;
      }

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

  const editProject = async (updatedData: { name: string; description: string; channel: "The Morroccan Analyst" | "The Morroccan CFO" | "Course", dueDate?: string }) => {
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
  
  const currentStatusIndex = statuses.indexOf(project.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
              <h1 className="text-4xl font-bold font-headline">{project.name}</h1>
              <p className="text-lg text-muted-foreground mt-1 max-w-3xl">{project.description}</p>
          </div>
          <EditProjectDialog project={project} onEditProject={editProject}>
              <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
              </Button>
          </EditProjectDialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <Card>
                <CardHeader>
                    <CardTitle>État d'avancement</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {statuses.map((status, index) => {
                            const isCompleted = index < currentStatusIndex;
                            const isActive = index === currentStatusIndex;
                            const StatusIcon = statusConfig[status].icon;
                            return (
                                <button key={status} onClick={() => updateStatus(status)} className={cn(
                                    "w-full flex items-center gap-4 p-3 rounded-md text-left transition-colors",
                                    isActive ? "bg-primary/10 text-primary font-bold" : "hover:bg-accent",
                                    isCompleted ? "text-muted-foreground" : "text-foreground"
                                )}>
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                        isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-muted text-muted-foreground" : "bg-accent"
                                    )}>
                                        <StatusIcon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium">{statusConfig[status].label}</span>
                                    {isCompleted && <CheckCircle2 className="h-5 w-5 ml-auto text-green-500" />}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                     <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <Badge variant="secondary">{project.channel}</Badge>
                    </div>
                    {project.dueDate && (
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                            <span>Publication prévue le {new Date(project.dueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    )}
                    {channelLink && (
                        <div className="flex items-center gap-3">
                            <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                            <a href={channelLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Voir sur YouTube
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Contenu du Projet</CardTitle>
                    <CardDescription>Organisez ici tous les éléments de votre projet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={['objectives', 'ideas']} className="w-full">
                        <AccordionItem value="objectives">
                            <AccordionTrigger className="text-lg font-medium"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Sujets Clés &amp; Plan</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input placeholder="Ajouter un sujet, un point du plan..." value={newObjective} onChange={(e) => setNewObjective(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('objectives', newObjective, 'add')} />
                                    <Button onClick={() => handleUpdateArrayField('objectives', newObjective, 'add')} disabled={!newObjective.trim()}>Ajouter</Button>
                                </div>
                                <ul className="space-y-2 pt-2">
                                    {(project.objectives && project.objectives.length > 0) ? (
                                        project.objectives.map((obj, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/50 group">
                                            <span className="flex-1">{obj}</span>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleUpdateArrayField('objectives', obj, 'remove')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                        ))
                                    ) : <p className="text-center text-muted-foreground py-4">Définissez ici les grands sujets à aborder.</p>}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ideas">
                            <AccordionTrigger className="text-lg font-medium"><Brain className="mr-2 h-5 w-5 text-primary"/>Idées &amp; Brainstorming</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input placeholder="Noter une idée, une phrase..." value={newIdea} onChange={(e) => setNewIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('ideas', newIdea, 'add')} />
                                    <Button onClick={() => handleUpdateArrayField('ideas', newIdea, 'add')} disabled={!newIdea.trim()}>Noter</Button>
                                </div>
                                <ul className="space-y-2 pt-2">
                                    {(project.ideas && project.ideas.length > 0) ? (
                                        project.ideas.map((idea, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/50 group">
                                            <span className="flex-1">{idea}</span>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleUpdateArrayField('ideas', idea, 'remove')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                        ))
                                    ) : <p className="text-center text-muted-foreground py-4">Votre espace de brainstorming est vide.</p>}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="links" className="border-b-0">
                            <AccordionTrigger className="text-lg font-medium"><FileArchive className="mr-2 h-5 w-5 text-primary"/>Ressources &amp; Liens</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                               <div className="space-y-2 rounded-lg border p-4">
                                    <h4 className="font-medium text-sm">Ajouter une nouvelle ressource</h4>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input placeholder="Titre (ex: Article sur l'inflation)" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} />
                                        <Input placeholder="URL (https://...)" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
                                        <Button onClick={() => handleUpdateArrayField('links', newLink, 'add')} disabled={!newLink.title.trim() || !newLink.url.trim()} className="sm:w-auto">Ajouter</Button>
                                    </div>
                                </div>
                                <ul className="space-y-2 pt-2">
                                    {(project.links && project.links.length > 0) ? (
                                        project.links.map((link, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent/50 group">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 flex-1 break-all">
                                                <LinkIcon className="h-4 w-4 flex-shrink-0" />
                                                {link.title}
                                            </a>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleUpdateArrayField('links', link, 'remove')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                        ))
                                    ) : <p className="text-center text-muted-foreground py-4">Aucune ressource enregistrée.</p>}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
