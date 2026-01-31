
'use server';
/**
 * @fileOverview An AI flow to generate LinkedIn carousel post ideas.
 *
 * - generateLinkedInCarousel - A function that creates a 5-slide carousel structure based on a topic.
 * - GenerateLinkedInCarouselInput - The input type for the flow.
 * - GenerateLinkedInCarouselOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string().describe('The concise, engaging title for this specific slide of the carousel.'),
  content: z.string().describe('The body text for this slide. Should be concise, use bullet points if necessary, and be impactful for a professional LinkedIn audience.'),
});

export const GenerateLinkedInCarouselInputSchema = z.object({
  topic: z.string().describe('The main topic or theme for the LinkedIn carousel post.'),
});
export type GenerateLinkedInCarouselInput = z.infer<typeof GenerateLinkedInCarouselInputSchema>;

export const GenerateLinkedInCarouselOutputSchema = z.object({
  slides: z.array(SlideSchema).length(5).describe('An array of exactly 5 slides for the LinkedIn carousel.'),
});
export type GenerateLinkedInCarouselOutput = z.infer<typeof GenerateLinkedInCarouselOutputSchema>;

export async function generateLinkedInCarousel(input: GenerateLinkedInCarouselInput): Promise<GenerateLinkedInCarouselOutput> {
  return generateCarouselFlow(input);
}

const carouselPrompt = ai.definePrompt({
  name: 'generateCarouselPrompt',
  input: { schema: GenerateLinkedInCarouselInputSchema },
  output: { schema: GenerateLinkedInCarouselOutputSchema },
  prompt: `You are an expert in social media content creation, specializing in engaging LinkedIn carousels for a professional audience in finance, management control, and tech automation.

Your task is to generate a 5-slide carousel post structure based on the provided topic.

The output MUST be a JSON object conforming to the specified output schema.

Follow this proven structure for maximum impact:
- Slide 1 (The Hook): Start with a strong, attention-grabbing statement, a controversial question, or a surprising statistic related to the topic.
- Slide 2 (The Problem/Context): Briefly explain the problem or provide context. Why should the audience care?
- Slide 3 (The Solution/Insight): Present the core insight, solution, or main points. Use bullet points for readability.
- Slide 4 (The "How-To" or Example): Give a practical example, a short "how-to," or a deeper insight into one of the points from slide 3.
- Slide 5 (The Call to Action): Conclude with a clear call to action. Ask a question to encourage comments, or prompt them to follow for more content.

Topic: {{{topic}}}
`,
});

const generateCarouselFlow = ai.defineFlow(
  {
    name: 'generateCarouselFlow',
    inputSchema: GenerateLinkedInCarouselInputSchema,
    outputSchema: GenerateLinkedInCarouselOutputSchema,
  },
  async (input) => {
    const { output } = await carouselPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate carousel content.");
    }
    return output;
  }
);
