"use client";

import type { WatchlistItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddWatchlistItemDialog } from "./add-watchlist-item-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Film, Tv, Pencil, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc, writeBatch, deleteField } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EditWatchlistItemDialog } from "./edit-watchlist-item-dialog";

export function Watchlist() {
  const { watchlist: items, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showWatched, setShowWatched] = useState(false);

  const addItem = async (newItemData: Omit<WatchlistItem, "id" | "watched">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add an item." });
      return;
    }
    const newItem: Omit<WatchlistItem, 'id'> & {id:string} = {
      ...newItemData,
      id: uuidv4(),
      watched: false,
      currentlyWatching: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "watchlist", newItem.id), newItem);
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new item." });
    }
  };

  const editItem = async (itemId: string, updatedData: Partial<Omit<WatchlistItem, 'id'>>) => {
    if (!user || !firestore) return;

    const dataToUpdate: any = { ...updatedData, updatedAt: new Date().toISOString() };

    if (updatedData.category === 'movie') {
        dataToUpdate.season = deleteField();
        dataToUpdate.episode = deleteField();
    } else { // It's a tv-show
        // If a field was submitted as undefined (e.g. empty input), ensure it's deleted from Firestore
        if (updatedData.hasOwnProperty('season') && updatedData.season === undefined) {
            dataToUpdate.season = deleteField();
        }
        if (updatedData.hasOwnProperty('episode') && updatedData.episode === undefined) {
            dataToUpdate.episode = deleteField();
        }
    }

    try {
        await updateDoc(doc(firestore, "users", user.uid, "watchlist", itemId), dataToUpdate);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update item." });
    }
  };

  const setCurrentItem = async (itemToSet: WatchlistItem) => {
    if (!user || !firestore) return;

    const isDeselecting = itemToSet.currentlyWatching;
    const batch = writeBatch(firestore);

    // 1. Reset all items to not-watching.
    items.forEach(item => {
      if (item.currentlyWatching) {
        const itemRef = doc(firestore, "users", user.uid, "watchlist", item.id);
        batch.update(itemRef, { currentlyWatching: false });
      }
    });
    
    // 2. If we are not deselecting, set the new item as currently watching.
    if (!isDeselecting) {
      const currentItemRef = doc(firestore, "users", user.uid, "watchlist", itemToSet.id);
      batch.update(currentItemRef, { currentlyWatching: true });
    }
    
    try {
      await batch.commit();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not set current item." });
    }
  };

  const toggleItem = async (item: WatchlistItem) => {
    if (!user || !firestore) return;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "watchlist", item.id), { 
            watched: !item.watched,
            updatedAt: new Date().toISOString()
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update item status." });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user || !firestore) return;
    try {
        await deleteDoc(doc(firestore, "users", user.uid, "watchlist", itemId));
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not delete item." });
    }
  };
  
  const itemsWatched = items.filter(i => i.watched).length;
  const filteredItems = items.filter(i => showWatched || !i.watched);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Films & Séries</CardTitle>
          <CardDescription>
            {itemsWatched} sur {items.length} vus.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Switch id="show-watched" checked={showWatched} onCheckedChange={setShowWatched} />
                <Label htmlFor="show-watched">Afficher les vus</Label>
            </div>
            <AddWatchlistItemDialog onAddItem={addItem} />
        </div>
      </CardHeader>
      <CardContent>
        {!isInitialized && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {isInitialized && filteredItems.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.watched}
                        onCheckedChange={() => toggleItem(item)}
                      />
                      <div className="flex items-center gap-2">
                        {item.category === 'movie' ? <Film className="h-4 w-4 text-muted-foreground" /> : <Tv className="h-4 w-4 text-muted-foreground" />}
                        <div>
                            <label
                            htmlFor={`item-${item.id}`}
                            className={cn(
                                "font-medium cursor-pointer",
                                item.watched && "text-muted-foreground line-through"
                            )}
                            >
                            {item.title}
                            </label>
                            {item.category === 'tv-show' && (item.season || item.episode) && (
                                <p className="text-xs text-muted-foreground">
                                    {item.season && `S${item.season}`}
                                    {item.season && item.episode && ' '}
                                    {item.episode && `E${item.episode}`}
                                </p>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setCurrentItem(item)}>
                        <PlayCircle className={cn("h-4 w-4", item.currentlyWatching && "text-primary fill-primary")} />
                        <span className="sr-only">Définir comme en cours de visionnage</span>
                      </Button>
                      <EditWatchlistItemDialog item={item} onEditItem={(updatedData) => editItem(item.id, updatedData)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                      </EditWatchlistItemDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          isInitialized && <p className="text-muted-foreground p-8 text-center">
            {showWatched ? "Aucun élément dans votre historique." : "Votre liste de visionnage est vide. Ajoutez un film ou une série pour commencer !"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
