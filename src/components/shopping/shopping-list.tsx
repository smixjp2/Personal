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
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";

export function ShoppingList() {
  const { shoppingList: items, setShoppingList: setItems, isInitialized } = useData();

  const addItem = (newItemData: Omit<ShoppingItem, "id" | "purchased">) => {
    const newItem: ShoppingItem = {
      ...newItemData,
      id: uuidv4(),
      purchased: false,
    };
    setItems(prev => [...prev, newItem]);
  };

  const toggleItem = (itemId: string) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, purchased: !i.purchased } : i))
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };
  
  const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const purchasedCost = items.reduce((sum, item) => sum + (item.purchased ? (item.price || 0) : 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Shopping List</CardTitle>
          <CardDescription>
            Total: ${totalCost.toFixed(2)} | Purchased: ${purchasedCost.toFixed(2)}
          </CardDescription>
        </div>
        <AddItemDialog onAddItem={addItem} />
      </CardHeader>
      <CardContent>
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
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={cn(
                          "font-medium cursor-pointer",
                          item.purchased && "text-muted-foreground line-through"
                        )}
                      >
                        {item.name}
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.price && (
                        <span className={cn("font-mono text-sm", item.purchased && "text-muted-foreground line-through")}>
                          ${item.price.toFixed(2)}
                        </span>
                      )}
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
          isInitialized && <p className="text-muted-foreground p-8 text-center">
            Your shopping list is empty. Add an item to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
