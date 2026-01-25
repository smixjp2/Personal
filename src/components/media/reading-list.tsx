"use client";

import { useState, useEffect } from "react";
import type { Book } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddBookDialog } from "./add-book-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function ReadingList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const q = query(collection(db, "readingList"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const booksData: Book[] = [];
      querySnapshot.forEach((doc) => {
        booksData.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(booksData);
      setIsLoading(false);
    }, () => {
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addBook = async (newBookData: Omit<Book, "id" | "read">) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await addDoc(collection(db, "readingList"), {
        ...newBookData,
        read: false,
      });
    } catch (error) {
      console.error("Error adding book: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible d'ajouter le livre. Veuillez réessayer.",
      });
    }
  };

  const toggleBook = async (bookId: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    const bookRef = doc(db, "readingList", bookId);
    const bookToToggle = books.find(b => b.id === bookId);
    if (bookToToggle) {
      try {
        await updateDoc(bookRef, { read: !bookToToggle.read });
      } catch (error) {
        console.error("Error toggling book: ", error);
        toast({
          variant: "destructive",
          title: "Oh non ! Quelque chose s'est mal passé.",
          description: "Impossible de mettre à jour le livre. Veuillez réessayer.",
        });
      }
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "La connexion à Firebase a échoué. Veuillez vérifier votre configuration.",
      });
      return;
    }
    try {
      await deleteDoc(doc(db, "readingList", bookId));
    } catch (error) {
      console.error("Error deleting book: ", error);
      toast({
        variant: "destructive",
        title: "Oh non ! Quelque chose s'est mal passé.",
        description: "Impossible de supprimer le livre. Veuillez réessayer.",
      });
    }
  };
  
  const booksRead = books.filter(b => b.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste de lecture</CardTitle>
          <CardDescription>
            {booksRead} sur {books.length} livres lus.
          </CardDescription>
        </div>
        <AddBookDialog onAddBook={addBook} />
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {!isLoading && books.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {books.map((book, index) => (
                <motion.li
                  key={book.id}
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
                        id={`book-${book.id}`}
                        checked={book.read}
                        onCheckedChange={() => toggleBook(book.id)}
                      />
                      <div>
                        <label
                          htmlFor={`book-${book.id}`}
                          className={cn(
                            "font-medium cursor-pointer",
                            book.read && "text-muted-foreground line-through"
                          )}
                        >
                          {book.title}
                        </label>
                        {book.author && <p className={cn("text-sm text-muted-foreground", book.read && "line-through")}>{book.author}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete book</span>
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          !isLoading && <p className="text-muted-foreground p-8 text-center">
            Votre liste de lecture est vide. Ajoutez un livre pour commencer !
          </p>
        )}
      </CardContent>
    </Card>
  );
}
