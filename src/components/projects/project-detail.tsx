
"use client";

import type { Project } from "@/lib/types";
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
import { Calendar, Pencil, ListTodo, CheckSquare, Lightbulb, Link as LinkIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, writeBatch, deleteField, arrayUnion, arrayRemove } from "firebase/firestore";
import { EditProjectDialog } from "./edit-project-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";

const statusTranslations: Record<Project['status'], string> = {
    idea: "Idée",
    scripting: "Script",
    recording: "Tournage",
    editing: "Montage",
    published: "Publié"
}

const channelLinks = {
  "The Morroccan Analyst": "https://www.youtube.com/channel/UCK6m2fe2txUxNFxpn65rURg",
  "The Morroccan CFO": "https://www.youtube.com/@TheMoroccanCFO",
};


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


  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <CardTitle className="text-3xl font-headline ">{project.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{project.channel}</Badge>
                    {channelLink && (
                        <a href={channelLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                           <LinkIcon className="h-3 w-3 mr-1" />
                           Voir la chaîne
                        </a>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Select onValueChange={updateStatus} value={project.status}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                         {Object.entries(statusTranslations).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
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
        <Tabs defaultValue="objectives" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="objectives"><CheckSquare className="mr-2 h-4 w-4" />Sujets Clés</TabsTrigger>
              <TabsTrigger value="ideas"><Lightbulb className="mr-2 h-4 w-4" />Idées & Notes</TabsTrigger>
              <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4" />Ressources & Liens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="objectives" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Sujets Clés</h3>
              <div className="flex items-center space-x-2">
                  <Input placeholder="Ajouter un sujet clé..." value={newObjective} onChange={(e) => setNewObjective(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('objectives', newObjective, 'add')} />
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
                    <p className="text-center text-muted-foreground pt-4">Aucun sujet clé défini pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>

          <TabsContent value="ideas" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Idées & Notes</h3>
              <div className="flex items-center space-x-2">
                  <Input placeholder="Noter une idée ou une note..." value={newIdea} onChange={(e) => setNewIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateArrayField('ideas', newIdea, 'add')} />
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
                    <p className="text-center text-muted-foreground pt-4">Aucune idée ou note enregistrée pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>

          <TabsContent value="links" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Ressources & Liens</h3>
              <div className="space-y-2 rounded-lg border p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="link-title" className="text-sm font-medium">Titre</label>
                      <Input id="link-title" placeholder="Ex: Article de recherche" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} />
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
                    <p className="text-center text-muted-foreground pt-4">Aucune ressource ou lien enregistré pour ce projet.</p>
                  )}
              </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
