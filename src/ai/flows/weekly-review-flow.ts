'use server';
/**
 * @fileOverview A flow to generate a weekly review using generative AI.
 *
 * - generateWeeklyReview - A function that generates a user's weekly review.
 * - WeeklyReviewInput - The input type for the generateWeeklyReview function.
 * - WeeklyReviewOutput - The return type for the generateWeeklyReview function.
 */

import {ai} from '@/ai/genkit';
import { WeeklyReviewInput, WeeklyReviewInputSchema, WeeklyReviewOutput, WeeklyReviewOutputSchema } from '@/lib/types';

export async function generateWeeklyReview(input: WeeklyReviewInput): Promise<WeeklyReviewOutput> {
  return weeklyReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklyReviewPrompt',
  input: {schema: WeeklyReviewInputSchema},
  output: {schema: WeeklyReviewOutputSchema},
  prompt: `You are a positive and insightful productivity coach named 'Architecte'. Your role is to generate a weekly review for a user based on their data from the past 7 days. Your tone should be encouraging, supportive, and motivating. All output must be in French.

Analyze the provided data: completed tasks, habit progress, goal and project statuses, and upcoming tasks.

Based on your analysis, generate a review with the following structure:
1.  **Title**: A catchy and positive title for the review.
2.  **Summary**: A short paragraph (2-3 sentences) summarizing the week's performance. Congratulate the user on their efforts and highlight one or two key wins.
3.  **Accomplishments**: Create a list of 3-4 key achievements from the past week. Focus on completed tasks, significant progress on habits, goals, or projects.
4.  **Suggestions**: Provide a list of 3-4 actionable suggestions for the upcoming week. These should be based on active goals, projects in progress, and upcoming tasks to help the user prioritize.

Here is the user's data for the past week:

**Tâches Terminées:**
{{#each completedTasks}}
- {{this.title}}
{{else}}
Aucune tâche terminée cette semaine.
{{/each}}

**Progression des Habitudes:**
{{#each activeHabits}}
- {{this.name}}: {{this.progress}}{{#if (eq this.frequency "daily")}}/1{{else}}%{{/if}}
{{/each}}

**Objectifs Actuels:**
{{#each goals}}
- {{this.name}} ({{this.progress}}%)
{{/each}}

**Projets Actuels:**
{{#each projects}}
- {{this.name}} (Statut: {{this.status}})
{{/each}}

**Tâches à Venir (prochains 7 jours):**
{{#each upcomingTasks}}
- {{this.title}}
{{/each}}

Now, generate the weekly review in the specified JSON format.
`,
});

const weeklyReviewFlow = ai.defineFlow(
  {
    name: 'weeklyReviewFlow',
    inputSchema: WeeklyReviewInputSchema,
    outputSchema: WeeklyReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
