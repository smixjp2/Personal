'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered task prioritization.
 *
 * - prioritizeTasks - A function that takes a list of tasks and goals, and returns a prioritized list of tasks.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      deadline: z.string().optional().describe('The deadline for the task (ISO format).'),
      goal: z.string().describe('The goal this task contributes to.'),
    })
  ).describe('A list of tasks to prioritize.'),
  goals: z.array(z.string()).describe('A list of active goals.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      priority: z.number().describe('The priority of the task (1-10, 1 being highest).'),
      reason: z.string().describe('The reasoning behind the assigned priority.'),
    })
  ).describe('A list of tasks with assigned priorities and reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI assistant designed to prioritize a user's tasks based on their goals and deadlines.

  Here are the user's goals: {{goals}}

  Here are the user's tasks:
  {{#each tasks}}
  - Name: {{this.name}}
    Deadline: {{this.deadline}}
    Goal: {{this.goal}}
  {{/each}}

  Prioritize the tasks based on how well they align with the user's goals and how soon their deadlines are. Output a numbered list of prioritized tasks, each with a priority (1-10, 1 being highest) and a brief explanation of why it was assigned that priority.

  Format your response as a JSON object conforming to the following schema:
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
