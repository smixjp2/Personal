"use client";

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
import { Trash2, Pencil, Bookmark } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EditBookDialog } from "./edit-book-dialog";

export function ReadingList() {
  const { readingList: books, isInitialized } = useData();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [showRead, setShowRead] = useState(false);

  const addBook = async (newBookData: Omit<Book, "id" | "read">) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a book." });
      return;
    }
    const newBook: Omit<Book, 'id'> & { id: string } = {
      ...newBookData,
      id: uuidv4(),
      read: false,
      currentlyReading: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
        await setDoc(doc(firestore, "users", user.uid, "reading-list", newBook.id), newBook);
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not save new book." });
    }
  };

  const editBook = async (bookId: string, updatedData: { title: string; author?: string }) => {
    if (!user || !firestore) return;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "reading-list", bookId), { ...updatedData, updatedAt: new Date().toISOString() });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update book." });
    }
  };

  const setCurrentBook = async (bookToSet: Book) => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);
    
    // Find all other books that are currently being read.
    const otherReadingBooks = books.filter(b => b.currentlyReading && b.id !== bookToSet.id);

    // Unset them.
    otherReadingBooks.forEach(book => {
      const bookRef = doc(firestore, "users", user.uid, "reading-list", book.id);
      batch.update(bookRef, { currentlyReading: false });
    });

    // Toggle the selected book.
    const newCurrentBookRef = doc(firestore, "users", user.uid, "reading-list", bookToSet.id);
    batch.update(newCurrentBookRef, { currentlyReading: !bookToSet.currentlyReading });


    try {
      await batch.commit();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not set current book." });
    }
  };

  const toggleBook = async (book: Book) => {
    if (!user || !firestore) return;
    try {
        await updateDoc(doc(firestore, "users", user.uid, "reading-list", book.id), { 
            read: !book.read,
            updatedAt: new Date().toISOString()
        });
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not update book status." });
    }
  };

  const deleteBook = async (bookId: string) => {
    if (!user || !firestore) return;
    try {
        await deleteDoc(doc(firestore, "users", user.uid, "reading-list", bookId));
    } catch(error: any) {
        toast({ variant: "destructive", title: "Firebase Error", description: error.message || "Could not delete book." });
    }
  };
  
  const booksRead = books.filter(b => b.read).length;
  const filteredBooks = books.filter(b => showRead || !b.read);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Liste de lecture</CardTitle>
          <CardDescription>
            {booksRead} sur {books.length} livres lus.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <Switch id="show-read" checked={showRead} onCheckedChange={setShowRead} />
                <Label htmlFor="show-read">Afficher les lus</Label>
            </div>
            <AddBookDialog onAddBook={addBook} />
        </div>
      </CardHeader>
      <CardContent>
        {!isInitialized && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {isInitialized && filteredBooks.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence>
              {filteredBooks.map((book, index) => (
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
                        onCheckedChange={() => toggleBook(book)}
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setCurrentBook(book)}>
                          <Bookmark className={cn("h-4 w-4", book.currentlyReading && "text-primary fill-primary")} />
                          <span className="sr-only">Définir comme lecture en cours</span>
                      </Button>
                      <EditBookDialog book={book} onEditBook={(updatedData) => editBook(book.id, updatedData)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier le livre</span>
                        </Button>
                      </EditBookDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer le livre</span>
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          isInitialized && <p className="text-muted-foreground p-8 text-center">
            {showRead ? "Aucun livre dans votre historique." : "Votre liste de lecture est vide. Ajoutez un livre pour commencer !"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
