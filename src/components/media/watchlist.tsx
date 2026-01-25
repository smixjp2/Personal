"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Film, Tv } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const q = query(collection(db, "watchlist"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: WatchlistItem[] = [];
      querySnapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as WatchlistItem);
      });
      setItems(itemsData);
      setIsLoading(false);
    }, () => {
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (newItemData: Omit<WatchlistItem, "id" | "watched">) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await addDoc(collection(db, "watchlist"), {
        ...newItemData,
        watched: false,
      });
    } catch (error) {
      console.error("Error adding item: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible d'ajouter l'élément. Veuillez réessayer.",
      });
    }
  };

  const toggleItem = async (itemId: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    const itemRef = doc(db, "watchlist", itemId);
    const itemToToggle = items.find(i => i.id === itemId);
    if (itemToToggle) {
      try {
        await updateDoc(itemRef, { watched: !itemToToggle.watched });
      } catch (error) {
        console.error("Error toggling item: ", error);
        toast({
          variant: "destructive",
          title: "Oh non ! Quelque chose s'est mal passé.",
          description: "Impossible de mettre à jour l'élément. Veuillez réessayer.",
        });
      }
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, "watchlist", itemId));
    } catch (error) {
      console.error("Error deleting item: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible de supprimer l'élément. Veuillez réessayer.",
      });
    }
  };
  
  const itemsWatched = items.filter(i => i.watched).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Films & Séries</CardTitle>
          <CardDescription>
            {itemsWatched} sur {items.length} vus.
          </CardDescription>
        </div>
        <AddWatchlistItemDialog onAddItem={addItem} />
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {!isLoading && items.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {items.map((item, index) => (
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
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="flex items-center gap-2">
                        {item.category === 'movie' ? <Film className="h-4 w-4 text-muted-foreground" /> : <Tv className="h-4 w-4 text-muted-foreground" />}
                        <label
                          htmlFor={`item-${item.id}`}
                          className={cn(
                            "font-medium cursor-pointer",
                            item.watched && "text-muted-foreground line-through"
                          )}
                        >
                          {item.title}
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete item</span>
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          !isLoading && <p className="text-muted-foreground p-8 text-center">
            Votre liste de visionnage est vide. Ajoutez un film ou une série pour commencer !
          </p>
        )}
      </CardContent>
    </Card>
  );
}
