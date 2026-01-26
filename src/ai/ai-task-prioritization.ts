'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered task prioritization.
 *
 * - prioritizeTasks - A function that takes a list of tasks and goals, and returns a prioritized list of tasks.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import { PrioritizeTasksInput, PrioritizeTasksInputSchema, PrioritizeTasksOutput, PrioritizeTasksOutputSchema } from '@/lib/types';

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant designed to prioritize a user's tasks based on their goals and deadlines.

  Here are the user's goals:
  {{#each goals}}
  - {{this}}
  {{/each}}

  Here are the user's tasks:
  {{#each tasks}}
  - Name: {{this.name}}
    Deadline: {{this.deadline}}
  {{/each}}

  Analyze the tasks and goals. Prioritize the tasks based on how well they align with the user's goals and how soon their deadlines are. Tasks that contribute to a goal should be prioritized higher. Urgency based on deadline is also a key factor.

  Output a prioritized list of tasks, each with a priority ("low", "medium", or "high") and a brief explanation of why it was assigned that priority.
  
  Format your response as a JSON object conforming to the following schema. Do not include any other text or explanations.
  {{outputSchemaDescription}}`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
