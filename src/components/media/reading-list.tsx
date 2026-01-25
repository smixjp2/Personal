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
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";
import { v4 as uuidv4 } from "uuid";

export function ReadingList() {
  const { readingList: books, setReadingList: setBooks, isInitialized } = useData();

  const addBook = (newBookData: Omit<Book, "id" | "read">) => {
    const newBook: Book = {
      ...newBookData,
      id: uuidv4(),
      read: false,
    };
    setBooks(prev => [...prev, newBook]);
  };

  const toggleBook = (bookId: string) => {
    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, read: !b.read } : b))
    );
  };

  const deleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
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
        {!isInitialized && <p className="text-muted-foreground p-8 text-center">Loading...</p>}
        {isInitialized && books.length > 0 ? (
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
          isInitialized && <p className="text-muted-foreground p-8 text-center">
            Votre liste de lecture est vide. Ajoutez un livre pour commencer !
          </p>
        )}
      </CardContent>
    </Card>
  );
}
