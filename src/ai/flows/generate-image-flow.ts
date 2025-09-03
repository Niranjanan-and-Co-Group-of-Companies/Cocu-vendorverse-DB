
'use server';
/**
 * @fileOverview An AI image generation flow.
 *
 * - generateImage - A function that generates an image from a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
  sourceImageUrl: z.string().optional().describe("An optional source image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt, sourceImageUrl }) => {

    if (sourceImageUrl) {
        // Image-to-Image generation
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
            prompt: [
                { media: { url: sourceImageUrl } },
                { text: prompt },
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        if (!media || !media.url) {
            throw new Error('Image generation failed to produce an image.');
        }
        return { imageUrl: media.url };

    } else {
        // Text-to-Image generation
        const { media } = await ai.generate({
          model: googleAI.model('imagen-4.0-fast-generate-001'),
          prompt: prompt,
        });

        if (!media || !media.url) {
            throw new Error('Image generation failed to produce an image.');
        }
        
        return { imageUrl: media.url };
    }
  }
);
