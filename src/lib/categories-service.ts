import { getAllProducts } from './products-service';
import type { Product } from './products';

export interface Category {
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

// In a real app, this might come from a separate 'categories' collection in Firestore
export async function getCategories(): Promise<Category[]> {
  const products = await getAllProducts();
  const categoryMap = new Map<string, { productCount: number, image?: string }>();

  products.forEach((product) => {
    if (product.category) {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, { productCount: 0, image: product.image });
      }
      const existing = categoryMap.get(product.category)!;
      existing.productCount++;
    }
  });

  const categories: Category[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
    productCount: data.productCount,
    image: data.image, // Use first product image as category image
  }));

  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await getCategories();
    return categories.find(c => c.slug === slug) || null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
    const products = await getAllProducts();
    const category = await getCategoryBySlug(slug);
    if (!category) {
        return [];
    }
    return products.filter(p => p.category === category.name);
}
