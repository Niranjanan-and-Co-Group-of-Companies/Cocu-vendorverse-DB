
'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/products';

const useRecentlyViewed = (maxItems: number = 5) => {
  const [viewed, setViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const storedItems = sessionStorage.getItem('recentlyViewed');
      if (storedItems) {
        setViewed(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Could not parse recently viewed items from sessionStorage", error);
      sessionStorage.removeItem('recentlyViewed');
    }
  }, []);

  const addRecentlyViewed = (product: Product) => {
    setViewed(currentViewed => {
      // Avoid adding duplicates and ensure the current product is at the beginning
      const newViewed = [product, ...currentViewed.filter(p => p.id !== product.id)].slice(0, maxItems);
      try {
        sessionStorage.setItem('recentlyViewed', JSON.stringify(newViewed));
      } catch (error) {
        console.error("Could not save recently viewed items to sessionStorage", error);
      }
      return newViewed;
    });
  };

  return { viewed, addRecentlyViewed };
};

export default useRecentlyViewed;
