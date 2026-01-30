"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser } from "@/firebase";

export function WelcomeBanner() {
  const { user } = useUser();
  const welcomeImage = PlaceHolderImages.find(
    (img) => img.id === "welcome-banner"
  );

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Bonjour"
      : today.getHours() < 18
      ? "Bon après-midi"
      : "Bonsoir";
  
  const displayName = user?.displayName?.split(' ')[0] || "Architect";

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
      <div className="relative bg-gradient-to-r from-primary/70 via-primary/50 to-transparent p-8 md:p-12">
        <h2 className="text-4xl font-bold text-white font-headline">
          {greeting}, {displayName}!
        </h2>
        <p className="mt-2 max-w-lg text-lg text-white/90">
          {"Prêt à architecturer votre journée ? C'est parti."}
        </p>
      </div>
    </div>
  );
}
