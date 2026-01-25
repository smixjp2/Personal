"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function WelcomeBanner() {
  const welcomeImage = PlaceHolderImages.find(
    (img) => img.id === "welcome-banner"
  );

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 18
      ? "Good Afternoon"
      : "Good Evening";
  
  const displayName = "Architect";

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
