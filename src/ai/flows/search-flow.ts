
'use server';
/**
 * @fileOverview A search suggestion AI flow.
 *
 * - getSearchSuggestions - A function that provides search suggestions.
 * - SearchSuggestionsInput - The input type for the getSearchSuggestions function.
 * - SearchSuggestionsOutput - The return type for the getSearchSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchSuggestionsInputSchema = z.object({
  query: z.string().describe('The partial search query from the user.'),
  products: z.array(z.object({
      name: z.string(),
      category: z.string().optional(),
      vendor: z.string(),
  })).describe("A list of available products to search against.").optional(),
});
export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 5-7 relevant search suggestions based on the user query and the provided product list for an e-commerce gift marketplace. The suggestions should include potential product names, categories, and vendors.'),
});
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

export async function getSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return getSearchSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSearchSuggestionsPrompt',
  input: { schema: SearchSuggestionsInputSchema },
  output: { schema: SearchSuggestionsOutputSchema },
  prompt: `You are a helpful search assistant for an e-commerce gift marketplace called CO&Cu. Your goal is to provide relevant search suggestions to users based on their query.

Analyze the user's query: {{{query}}}

{{#if products}}
You have been provided with a list of available products. Use this list as the primary source of truth. Generate a list of 5 to 7 diverse and relevant search suggestions based on the user's query that match product names, categories, or vendors from the list.

Available products:
{{#each products}}
- {{this.name}} (Category: {{this.category}}, Vendor: {{this.vendor}})
{{/each}}
{{else}}
Based on the user's query, generate a list of 5 to 7 diverse and relevant search suggestions. The suggestions can be product names, categories, or vendors that are likely to match the user's intent. Do not suggest anything that would not be found on a gift website.
{{/if}}
`,
});

const getSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'getSearchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async (input) => {
    if (!input.query) {
        return { suggestions: [] };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
