
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
import type { Product } from '@/lib/products';

const SearchSuggestionsInputSchema = z.object({
  query: z.string().describe('The partial search query from the user.'),
  products: z.array(z.object({
    id: z.number(),
    name: z.string(),
    vendor: z.string(),
    price: z.string(),
    image: z.string(),
    rating: z.number(),
    customizable: z.boolean(),
    featured: z.boolean().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  })).describe('The list of all available products.')
});
export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsInputSchema>;

const SearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 5-7 relevant search suggestions based on the user query and available products. The suggestions should include product names, categories, and vendors.'),
});
export type SearchSuggestionsOutput = z.infer<typeof SearchSuggestionsOutputSchema>;

export async function getSearchSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestionsOutput> {
  return getSearchSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSearchSuggestionsPrompt',
  input: { schema: SearchSuggestionsInputSchema },
  output: { schema: SearchSuggestionsOutputSchema },
  prompt: `You are a helpful search assistant for an e-commerce platform called VendorVerse. Your goal is to provide relevant search suggestions to users based on their query and the available products.

Analyze the user's query: {{{query}}}

And the list of available products:
{{#each products}}
- {{name}} (Category: {{category}}, Vendor: {{vendor}})
{{/each}}

Based on this, generate a list of 5 to 7 diverse and relevant search suggestions. The suggestions can be product names, categories, or vendors that are likely to match the user's intent. Do not suggest products that are not in the list.`,
});

const getSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'getSearchSuggestionsFlow',
    inputSchema: SearchSuggestionsInputSchema,
    outputSchema: SearchSuggestionsOutputSchema,
  },
  async (input) => {
    // For simplicity in this example, we'll return a static list if the query is short.
    // A real implementation would have a more robust check or always call the LLM.
    if (input.query.length < 2) {
      return { suggestions: ["Gifts for him", "Corporate Gifts", "Chocolate", "Wellness", "Personalized"] };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
