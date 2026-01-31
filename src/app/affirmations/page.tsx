import { AffirmationsList } from "@/components/affirmations/affirmations-list";

export default function AffirmationsPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Affirmations</h1>
        <p className="text-lg text-muted-foreground">
            Renforcez votre état d'esprit avec des affirmations positives. Répétez-les quotidiennement.
        </p>
        <AffirmationsList />
    </div>
  );
}
