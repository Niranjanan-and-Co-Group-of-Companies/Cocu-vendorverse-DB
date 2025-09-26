
'use server';
/**
 * @fileOverview An AI-powered product search flow.
 *
 * - searchProducts - A function that returns a list of product IDs based on a natural language query.
 * - SearchProductsInput - The input type for the function.
 * - SearchProductsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchProductsInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
  products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      category: z.string(),
      tags: z.array(z.string()).optional(),
  })).describe("A list of all available products to search against."),
});
export type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

const SearchProductsOutputSchema = z.object({
  productIds: z.array(z.string()).describe('An ordered list of product IDs that are most relevant to the user\'s query.'),
});
export type SearchProductsOutput = z.infer<typeof SearchProductsOutputSchema>;

export async function searchProducts(input: SearchProductsInput): Promise<SearchProductsOutput> {
  return searchProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchProductsPrompt',
  input: { schema: SearchProductsInputSchema },
  output: { schema: SearchProductsOutputSchema },
  prompt: `You are an expert e-commerce search engine for a gift marketplace called CO&Cu.
Your task is to analyze a user's search query and return a list of the most relevant product IDs from the provided product list.

Analyze the user's query for intent, occasions, relationships, and product attributes. For example, "valentines day gifts for wife" should look for romantic gifts, items suitable for women, and products with "love" or "heart" themes.

User Query: {{{query}}}

Available Products:
{{#each products}}
- ID: {{this.id}}
  Name: {{this.name}}
  Category: {{this.category}}
  Description: {{this.description}}
  {{#if this.tags}}Tags: {{#each this.tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/each}}

Based on your analysis, return a ranked list of product IDs. The most relevant products should appear first.
Only return product IDs from the provided list. Do not invent new IDs.
If no products are relevant, return an empty list.`,
});

const searchProductsFlow = ai.defineFlow(
  {
    name: 'searchProductsFlow',
    inputSchema: SearchProductsInputSchema,
    outputSchema: SearchProductsOutputSchema,
  },
  async (input) => {
    if (!input.query) {
        return { productIds: [] };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
