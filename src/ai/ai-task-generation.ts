// src/ai/ai-task-generation.ts
'use server';
/**
 * @fileOverview A flow to generate tasks for project completion using generative AI.
 *
 * - generateTasks - A function that generates tasks for project completion.
 * - GenerateTasksInput - The input type for the generateTasks function.
 * - GenerateTasksOutput - The return type for the generateTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTasksInputSchema = z.object({
  projectDescription: z.string().describe('The description of the project for which tasks need to be generated.'),
  projectType: z.string().describe('The type of project (e.g., course, personal, professional).'),
  desiredNumberOfTasks: z.number().describe('The desired number of tasks to generate.'),
});
export type GenerateTasksInput = z.infer<typeof GenerateTasksInputSchema>;

const GenerateTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('An array of tasks generated for the project.'),
});
export type GenerateTasksOutput = z.infer<typeof GenerateTasksOutputSchema>;

export async function generateTasks(input: GenerateTasksInput): Promise<GenerateTasksOutput> {
  return generateTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: {schema: GenerateTasksInputSchema},
  output: {schema: GenerateTasksOutputSchema},
  prompt: `You are an AI task generator that helps users break down their projects into smaller, manageable tasks.

  Based on the project description and type provided by the user, you will generate a list of tasks required for the successful completion of the project.

  Project Description: {{{projectDescription}}}
  Project Type: {{{projectType}}}
  Desired Number of Tasks: {{{desiredNumberOfTasks}}}

  Tasks:`, 
});

const generateTasksFlow = ai.defineFlow(
  {
    name: 'generateTasksFlow',
    inputSchema: GenerateTasksInputSchema,
    outputSchema: GenerateTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
