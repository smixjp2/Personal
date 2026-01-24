"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Bell, Search, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/habits": "Habit Tracker",
  "/goals": "Goal Management",
  "/tasks": "Task Inbox",
  "/calendar": "Calendar",
  "/shopping": "Liste d'achats",
  "/media": "Médiathèque",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const avatarImage = PlaceHolderImages.find((img) => img.id === "user-avatar");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">
        {pageTitles[pathname] || "Life Architect"}
      </h1>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden w-full max-w-sm items-center md:flex">
          <Input id="search" type="search" placeholder="Search..." className="pl-10" />
          <span className="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search className="size-5 text-muted-foreground" />
          </span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have 2 new messages.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">Goal Update</p>
                    <p className="text-sm text-muted-foreground">
                      You are 80% to completing "Advanced React Course"!
                    </p>
                  </div>
                </div>
                 <div className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">New Task</p>
                    <p className="text-sm text-muted-foreground">
                      AI suggests a new task for "Project Phoenix".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                {user?.photoURL ? (
                  <AvatarImage
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                  />
                ) : avatarImage && (
                  <AvatarImage
                    src={avatarImage.imageUrl}
                    alt="User Avatar"
                    data-ai-hint={avatarImage.imageHint}
                  />
                )}
                <AvatarFallback>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'LA'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
