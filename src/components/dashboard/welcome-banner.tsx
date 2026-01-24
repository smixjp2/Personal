"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function WelcomeBanner() {
  const [user, setUser] = useState<User | null>(null);
  const welcomeImage = PlaceHolderImages.find(
    (img) => img.id === "welcome-banner"
  );

  useEffect(() => {
    if (!auth) return; // Do not run auth logic if Firebase is not configured
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 18
      ? "Good Afternoon"
      : "Good Evening";
  
  const displayName = user?.displayName?.split(' ')[0] || "User";

  return (
    <div className="relative overflow-hidden rounded-lg">
      {welcomeImage && (
        <Image
          src={welcomeImage.imageUrl}
          alt={welcomeImage.description}
          data-ai-hint={welcomeImage.imageHint}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="relative bg-gradient-to-r from-black/70 to-black/30 p-8 md:p-12">
        <h2 className="text-3xl font-bold text-white font-headline">
          {greeting}, {displayName}!
        </h2>
        <p className="mt-2 max-w-lg text-lg text-white/90">
          {"Ready to architect your day? Let's make things happen."}
        </p>
      </div>
    </div>
  );
}
