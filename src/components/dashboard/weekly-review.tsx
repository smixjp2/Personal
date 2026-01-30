'use client';

import { useState } from 'react';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Wand2, Star, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { generateWeeklyReview } from '@/ai/flows/weekly-review-flow';
import type { WeeklyReviewOutput } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function WeeklyReview() {
  const { isInitialized, habits, goals, projects } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [review, setReview] = useState<WeeklyReviewOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateReview = async () => {
    setIsGenerating(true);

    try {
      const reviewData = {
        activeHabits: habits.map(({ name, progress, frequency }) => ({ name, progress, frequency })),
        goals: goals.map(({ name, progress }) => ({ name, progress })),
        projects: projects.map(({ name, status }) => ({ name, status })),
      };

      const result = await generateWeeklyReview(reviewData);
      setReview(result);
      setIsDialogOpen(true);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur IA',
        description: 'Impossible de générer la revue hebdomadaire pour le moment.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <Button onClick={handleGenerateReview} disabled={isGenerating || !isInitialized} size="lg">
          <Wand2 className="mr-2 h-5 w-5" />
          {isGenerating ? 'Analyse en cours...' : 'Générer ma Revue Hebdomadaire'}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {review ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline text-center">{review.title}</DialogTitle>
                <DialogDescription className="text-center pt-2">{review.summary}</DialogDescription>
              </DialogHeader>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500"/> Accomplissements</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {review.accomplishments.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Suggestions pour la semaine</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {review.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Separator className="my-4" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                 </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
