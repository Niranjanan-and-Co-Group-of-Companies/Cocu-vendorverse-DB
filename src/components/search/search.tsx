
'use client';

import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSearchSuggestions } from '@/ai/flows/search-flow';
import type { Product } from '@/lib/products';
import { getAllProducts } from '@/lib/products-service';

export function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      setLoadingProducts(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 1 && !loadingProducts) {
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const result = await getSearchSuggestions({ query, products });
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          // Fallback to simple filtering if AI flow fails
          const filteredProducts = products
            .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
            .map(p => p.name)
            .slice(0, 5);
          setSuggestions(filteredProducts);
        }
        setLoading(false);
      };
      const debounce = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
    }
  }, [query, products, loadingProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${query}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-lg relative" ref={searchContainerRef}>
      <form onSubmit={handleSearch}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for gifts, vendors, and more..."
          className="pl-10 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        {(loading || loadingProducts) && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
      </form>
      {showSuggestions && (suggestions.length > 0 || (loading && query.length > 1)) && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          <ul className="py-1">
            {loading && query.length > 1 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                </li>
            ) : (
                <>
                    {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </li>
                    ))}
                    {suggestions.length === 0 && !loading && query.length > 1 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">No suggestions found.</li>
                    )}
                </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
