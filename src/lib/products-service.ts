import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

const MOCK_PRODUCTS: Product[] = [
    {
    id: 1,
    name: 'Artisanal Chocolate Box',
    vendor: 'Gourmet Delights',
    price: '$45.00',
    image: 'https://picsum.photos/600/400?random=1',
    rating: 4.8,
    customizable: true,
    featured: true,
    description: "A decadent assortment of handcrafted chocolates, perfect for any sweet tooth.",
    category: "Food & Drink",
  },
  {
    id: 2,
    name: 'Luxury Spa Set',
    vendor: 'Serene Moments',
    price: '$85.00',
    image: 'https://picsum.photos/600/400?random=2',
    rating: 4.9,
    customizable: false,
    featured: true,
    description: "A complete home-spa experience with bath bombs, lotions, and scented candles.",
    category: "Wellness",
  },
  {
    id: 3,
    name: 'Handcrafted Leather Wallet',
    vendor: 'Heritage Wares',
    price: '$75.00',
    image: 'https://picsum.photos/600/400?random=3',
    rating: 4.7,
    customizable: true,
    featured: true,
    description: "A timeless and durable wallet made from full-grain leather, with custom monogram options.",
    category: "Fashion & Accessories",
  },
  {
    id: 4,
    name: 'Gourmet Coffee Collection',
    vendor: 'The Daily Grind',
    price: '$55.00',
    image: 'https://picsum.photos/600/400?random=4',
    rating: 4.8,
    customizable: false,
    featured: true,
    description: "A selection of single-origin coffee beans from around the world.",
    category: "Food & Drink",
  },
  {
    id: 5,
    name: 'Exotic Tea Sampler',
    vendor: 'The Tea Leaf',
    price: '$40.00',
    image: 'https://picsum.photos/600/400?random=5',
    rating: 4.9,
    customizable: false,
    featured: true,
    description: "Explore a variety of rare and exotic teas in this beautifully packaged sampler.",
    category: "Food & Drink",
  },
  {
    id: 6,
    name: 'Custom Engraved Pen',
    vendor: 'Signature Gifts',
    price: '$95.00',
    image: 'https://picsum.photos/600/400?random=6',
rating: 4.6,
    customizable: true,
    featured: true,
    description: "A sophisticated writing instrument that can be engraved with a name or message.",
    category: "Office & Corporate",
  },
  {
    id: 7,
    name: 'Smart Water Bottle',
    vendor: 'Techie Gifts',
    price: '$60.00',
    image: 'https://picsum.photos/600/400?random=7',
    rating: 4.5,
    customizable: false,
    featured: false,
    description: "A bottle that tracks your water intake and glows to remind you to hydrate.",
    category: "Tech",
  },
  {
    id: 8,
    name: 'Personalized Star Map',
    vendor: 'Cosmic Prints',
    price: '$50.00',
    image: 'https://picsum.photos/600/400?random=8',
    rating: 4.9,
    customizable: true,
    featured: false,
    description: "A map of the stars on a specific date, like an anniversary or birthday.",
    category: "Home & Decor",
  },
];


const productsCollection = collection(db, 'products');

async function seedProducts() {
  const batch = writeBatch(db);
  MOCK_PRODUCTS.forEach((product) => {
    const docRef = doc(db, 'products', String(product.id));
    batch.set(docRef, product);
  });
  await batch.commit();
}

let productsCache: Product[] | null = null;

export async function getAllProducts(): Promise<Product[]> {
    if (productsCache) {
        return productsCache;
    }

  const snapshot = await getDocs(productsCollection);
  if (snapshot.empty) {
    try {
        await seedProducts();
        const seededSnapshot = await getDocs(productsCollection);
        productsCache = seededSnapshot.docs.map((doc) => doc.data() as Product);
        return productsCache;
    } catch (e) {
        console.error("Failed to seed products:", e);
        return [];
    }
  }
  
  productsCache = snapshot.docs.map((doc) => doc.data() as Product);
  return productsCache;
}
