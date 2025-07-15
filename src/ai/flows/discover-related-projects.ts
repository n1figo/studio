// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent for discovering related projects that might enhance user goals.
 *
 * - discoverRelatedProjects - A function that handles the project discovery process.
 * - DiscoverRelatedProjectsInput - The input type for the discoverRelatedProjects function.
 * - DiscoverRelatedProjectsOutput - The return type for the discoverRelatedProjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscoverRelatedProjectsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to discover related projects.'),
});
export type DiscoverRelatedProjectsInput = z.infer<typeof DiscoverRelatedProjectsInputSchema>;

const DiscoverRelatedProjectsOutputSchema = z.object({
  relatedProjects: z
    .array(z.string())
    .describe('A list of related projects that could enhance the user\s goals.'),
});
export type DiscoverRelatedProjectsOutput = z.infer<typeof DiscoverRelatedProjectsOutputSchema>;

export async function discoverRelatedProjects(
  input: DiscoverRelatedProjectsInput
): Promise<DiscoverRelatedProjectsOutput> {
  return discoverRelatedProjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'discoverRelatedProjectsPrompt',
  input: {schema: DiscoverRelatedProjectsInputSchema},
  output: {schema: DiscoverRelatedProjectsOutputSchema},
  prompt: `You are an expert project discovery assistant. Your job is to find
related projects that can help the user enhance their goals.

Given the task description, suggest a few related projects that the user
might be interested in.

Task Description: {{{taskDescription}}}

Consider projects across different domains, but still generally related to the
provided task description. The projects should be synergistic and help the user
broaden their perspective.

Return the projects as a list of strings.
`,
});

const discoverRelatedProjectsFlow = ai.defineFlow(
  {
    name: 'discoverRelatedProjectsFlow',
    inputSchema: DiscoverRelatedProjectsInputSchema,
    outputSchema: DiscoverRelatedProjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
