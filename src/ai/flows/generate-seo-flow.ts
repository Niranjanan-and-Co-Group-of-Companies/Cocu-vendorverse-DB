
'use server';
/**
 * @fileOverview An AI flow for generating SEO metadata for products.
 *
 * - generateSeoMetadata - A function that creates SEO-optimized titles, descriptions, and slugs.
 * - GenerateSeoMetadataInput - The input type for the function.
 * - GenerateSeoMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// --- Input and Output Schemas ---

const GenerateSeoMetadataInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  description: z.string().describe('The detailed description of the product.'),
  category: z.string().describe('The category the product belongs to.'),
  existingTitle: z.string().optional().describe('An optional existing SEO title to be improved upon.'),
  existingDescription: z.string().optional().describe('An optional existing meta description to be improved upon.'),
  performanceFeedback: z.string().optional().describe('Feedback based on analytics data, e.g., "CTR is low" or "Conversion is poor".'),
});
export type GenerateSeoMetadataInput = z.infer<typeof GenerateSeoMetadataInputSchema>;

const GenerateSeoMetadataOutputSchema = z.object({
  title: z.string().describe('A compelling, SEO-friendly title, under 60 characters.'),
  metaDescription: z.string().describe('An engaging meta description for search engine results, under 160 characters.'),
  slug: z.string().describe('A URL-friendly slug for the product page.'),
  imageAltText: z.string().describe('A descriptive alt text for the main product image.'),
});
export type GenerateSeoMetadataOutput = z.infer<typeof GenerateSeoMetadataOutputSchema>;


const ReviewerOutputSchema = z.object({
    isApproved: z.boolean().describe('Whether the SEO content meets all the rules.'),
    feedback: z.string().optional().describe('Specific, actionable feedback for improvement if not approved. Mention the specific rule that was violated.'),
});

// --- Prompts ---

const generatorPrompt = ai.definePrompt({
  name: 'seoGenerator',
  input: { schema: GenerateSeoMetadataInputSchema },
  output: { schema: GenerateSeoMetadataOutputSchema },
  prompt: `You are an expert SEO copywriter for an e-commerce gift marketplace called CO&Cu. Your task is to generate compelling, SEO-optimized metadata for a product.

Product Name: {{{productName}}}
Category: {{{category}}}
Description: {{{description}}}

{{#if performanceFeedback}}
This product's metadata is being re-optimized based on the following performance data:
- Feedback: {{{performanceFeedback}}}
- Existing Title: {{{existingTitle}}}
- Existing Description: {{{existingDescription}}}
Your primary goal is to address this performance feedback in your new metadata.
{{else}}
This is a new product. Your goal is to create the best possible metadata for its initial launch.
{{/if}}

{{#if feedback}}
The previous generation was reviewed and needs improvement. Address the following feedback:
- Feedback: {{{feedback}}}
- Previous Title: {{{previousTitle}}}
- Previous Description: {{{previousDescription}}}
Incorporate this feedback to generate a better version.
{{/if}}

Generate the following fields based on the rules below:

Rules:
1.  **Title**: Must be under 60 characters. It should be catchy and include the main keyword (product name). Incorporate words that evoke emotion or value for a gift (e.g., "Perfect," "Unique," "Personalized").
2.  **Meta Description**: Must be under 160 characters. It should be a compelling summary that encourages clicks. Include a call-to-action like "Shop Now" or "Discover".
3.  **Slug**: A URL-friendly version of the product name. Use lowercase letters, numbers, and hyphens only.
4.  **Image Alt Text**: A descriptive sentence explaining what is in the product image for accessibility and SEO.
`,
});

const reviewerPrompt = ai.definePrompt({
    name: 'seoReviewer',
    input: { schema: GenerateSeoMetadataOutputSchema },
    output: { schema: ReviewerOutputSchema },
    prompt: `You are a strict SEO editor. Your task is to review the given SEO metadata based on a set of rules.

SEO Content to Review:
- Title: {{{title}}}
- Meta Description: {{{metaDescription}}}
- Slug: {{{slug}}}

Rules:
1.  **Title Length**: Is the title under 60 characters?
2.  **Meta Description Length**: Is the meta description under 160 characters?
3.  **Slug Format**: Does the slug contain only lowercase letters, numbers, and hyphens?
4.  **Compelling Language**: Is the language engaging and appropriate for a gift marketplace? Does the description have a call-to-action?

Based on these rules, determine if the content is approved. If it is not approved, provide specific, actionable feedback on which rule was broken and how to fix it.
`,
});

// --- Main Flow ---

const generateSeoFlow = ai.defineFlow(
  {
    name: 'generateSeoFlow',
    inputSchema: GenerateSeoMetadataInputSchema,
    outputSchema: GenerateSeoMetadataOutputSchema,
  },
  async (input) => {

    // First Generation
    const initialGeneration = await generatorPrompt(input);
    let currentSeo = initialGeneration.output!;

    // First Review
    const review = await reviewerPrompt(currentSeo);
    const reviewOutput = review.output!;

    // Arbiter Logic
    if (!reviewOutput.isApproved) {
        console.log(`SEO generation requires revision. Feedback: ${reviewOutput.feedback}`);

        // Second (and final) Generation attempt with feedback
        const revisedGeneration = await generatorPrompt({
            ...input,
            feedback: reviewOutput.feedback,
            previousTitle: currentSeo.title,
            previousDescription: currentSeo.metaDescription,
        });

        currentSeo = revisedGeneration.output!;
    }
    
    // In a production system, you might add a final check here, and if it still fails,
    // you could flag it for human review. For now, we accept the second attempt.

    console.log("Final SEO Metadata:", currentSeo);
    return currentSeo;
  }
);


export async function generateSeoMetadata(input: GenerateSeoMetadataInput): Promise<GenerateSeoMetadataOutput> {
  return generateSeoFlow(input);
}
