
import * as React from 'react';
import { getProductById } from '@/lib/products-service';
import { type Metadata } from 'next';
import { ProductPageClient } from '@/components/product/product-page-client';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    }
  }

  return {
    title: `${product.name} (Corporate) | VendorVerse`,
    description: product.description?.substring(0, 160) || 'Discover unique corporate gifts at VendorVerse.',
    openGraph: {
      title: `${product.name} (Corporate)`,
      description: product.description?.substring(0, 160) || 'Discover unique corporate gifts at VendorVerse.',
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} (Corporate)`,
      description: product.description?.substring(0, 160) || 'Discover unique corporate gifts at VendorVerse.',
      images: [product.image],
    },
  }
}

export default function CorporateProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <main className="flex-grow">
            <ProductPageClient id={id} />
        </main>
    );
}
