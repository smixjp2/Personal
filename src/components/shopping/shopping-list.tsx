
"use client";

import type { ShoppingItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddItemDialog } from "./add-item-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc, deleteField } from "firebase/firestore";
import { SpendingCharts } from "./spending-charts";
import { Badge } from "../ui/badge";
import { EditItemDialog } from "./edit-item-dialog";

const categoryTranslations = {
    groceries: "Courses",
    subscription: "Abonnement",
    entertainment: "Divertissement",
    utilities: "Charges",
    shopping: "Shopping",
    other: "Autre",
};

const frequencyTranslations = {
    "one-time": "Ponctuel",
    "daily": "Quotidien",
    "monthly": "Mensuel",
    "yearly": "Annuel",
};


export function ShoppingList() {
  const { shoppingList: items, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addItem = async (newItemData: Omit<ShoppingItem, "id" | "purchased">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add an item." });
      return;
    }
    const id = uuidv4();
    const dataToSave: any = {
      name: newItemData.name,
      category: newItemData.category,
      frequency: newItemData.frequency || "one-time",
      purchased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newItemData.price) {
        dataToSave.price = newItemData.price;
    }
    if (newItemData.date) {
        dataToSave.date = newItemData.date;
    }

    try {
        await setDoc(doc(firestore, "users", user.uid, "shopping-list", id), dataToSave);
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new item." });
    }
  };

  const editItem = async (itemId: string, updatedData: Partial<Omit<ShoppingItem, 'id'>>) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to edit an item." });
      return;
    }
    const itemRef = doc(firestore, "users", user.uid, "shopping-list", itemId);
    const dataToUpdate: any = {
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    if (updatedData.price === undefined) {
        dataToUpdate.price = deleteField();
    }
     if (updatedData.date === undefined) {
        dataToUpdate.date = deleteField();
    }
    try {
        await updateDoc(itemRef, dataToUpdate);
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update item." });
    }
  };

  const toggleItem = async (item: ShoppingItem) => {
    if (!user || !firestore) return;
    const isNowPurchased = !item.purchased;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "shopping-list", item.id), { 
            purchased: isNowPurchased,
            purchasedAt: isNowPurchased ? new Date().toISOString() : deleteField(),
            updatedAt: new Date().toISOString()
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update item status." });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user || !firestore) return;
    try {
        await deleteDoc(doc(firestore, "users", user.uid, "shopping-list", itemId));
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not delete item." });
    }
  };
  
  const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const purchasedCost = items.reduce((sum, item) => sum + (item.purchased ? (item.price || 0) : 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste d'achats mensuelle</CardTitle>
          <CardDescription>
            Total: {formatCurrency(totalCost)} MAD | Acheté: {formatCurrency(purchasedCost)} MAD
          </CardDescription>
        </div>
        <AddItemDialog onAddItem={addItem} />
      </CardHeader>
      <CardContent>
        {isInitialized && <SpendingCharts items={items} />}
        {!isInitialized && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {isInitialized && items.length > 0 ? (
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
                        checked={item.purchased}
                        onCheckedChange={() => toggleItem(item)}
                      />
                      <div className="grid gap-0.5">
                        <label
                          htmlFor={`item-${item.id}`}
                          className={cn(
                            "font-medium cursor-pointer",
                            item.purchased && "text-muted-foreground line-through"
                          )}
                        >
                          {item.name}
                        </label>
                        {item.date && !item.purchased && (
                          <p className="text-xs text-muted-foreground">
                              Due: {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </p>
                        )}
                        {item.purchased && item.purchasedAt && (
                          <p className="text-xs text-muted-foreground">
                              Acheté le {new Date(item.purchasedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{categoryTranslations[item.category] || item.category}</Badge>
                      {item.frequency && item.frequency !== 'one-time' && (
                        <Badge variant="secondary">{frequencyTranslations[item.frequency as keyof typeof frequencyTranslations]}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {item.price && (
                        <span className={cn("font-mono text-sm", item.purchased && "text-muted-foreground line-through")}>
                          {formatCurrency(item.price)} MAD
                        </span>
                      )}
                      <div className="flex items-center">
                        <EditItemDialog item={item} onEditItem={(updatedData) => editItem(item.id, updatedData)}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier l'article</span>
                            </Button>
                        </EditItemDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer l'article</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          isInitialized && <p className="text-muted-foreground p-8 text-center">
            Votre liste d'achats est vide. Ajoutez un article pour commencer !
          </p>
        )}
      </CardContent>
    </Card>
  );
}
