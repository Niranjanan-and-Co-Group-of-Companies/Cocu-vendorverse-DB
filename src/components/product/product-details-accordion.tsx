
'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ProductDetailsAccordionProps {
  description: string;
  creatorStory: string;
}

export function ProductDetailsAccordion({ description, creatorStory }: ProductDetailsAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue="description" className="w-full">
      <AccordionItem value="description">
        <AccordionTrigger className="text-xl font-bold font-headline">Description</AccordionTrigger>
        <AccordionContent className="text-base text-muted-foreground">
          {description}
        </AccordionContent>
      </AccordionItem>
      {creatorStory && (
        <AccordionItem value="creator-story">
            <AccordionTrigger className="text-xl font-bold font-headline">Creator Story</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
            {creatorStory}
            </AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="reviews">
        <AccordionTrigger className="text-xl font-bold font-headline">Reviews</AccordionTrigger>
        <AccordionContent className="text-base text-muted-foreground">
          Review functionality coming soon.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
