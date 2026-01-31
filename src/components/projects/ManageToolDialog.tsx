"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useState } from 'react';
import type { ProjectTool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc } from 'firebase/firestore';

const toolSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  link: z.string().url("Le lien doit être une URL valide."),
});

type FormValues = z.infer<typeof toolSchema>;

type ManageToolDialogProps = {
  children: React.ReactNode;
  projectId: string;
  tool?: ProjectTool;
  onSave?: () => void;
};

export function ManageToolDialog({ children, projectId, tool, onSave }: ManageToolDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(toolSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(tool || { name: "", link: "" });
    }
  }, [isOpen, tool, form]);

  const isEditing = !!tool;

  async function onSubmit(values: FormValues) {
    if (!user || !firestore) return;
    
    const toolId = tool?.id || uuidv4();
    const ref = doc(firestore, 'users', user.uid, 'projects', projectId, 'tools', toolId);
    
    const dataToSave = {
      ...values,
      id: toolId,
      updatedAt: new Date().toISOString(),
      ...( !isEditing && { createdAt: new Date().toISOString() } )
    };

    try {
      await setDoc(ref, dataToSave, { merge: true });
      toast({ title: isEditing ? 'Outil mis à jour !' : 'Outil ajouté !' });
      onSave?.();
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder l\'outil.' });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'outil" : "Nouvel Outil"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Mettez à jour ce lien." : "Ajoutez un lien vers un outil ou une ressource."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="ex: Canva" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem><FormLabel>Lien</FormLabel><FormControl><Input placeholder="https://www.canva.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter className="pt-4"><Button type="submit">Sauvegarder</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
