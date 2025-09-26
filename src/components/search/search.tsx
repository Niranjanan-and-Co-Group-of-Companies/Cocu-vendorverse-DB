
'use client';

import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSearchSuggestions } from '@/ai/flows/search-flow';
import { getSearchIndex, type SearchIndex } from '@/lib/products-service';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchProps {
    platform?: 'personalized' | 'corporate';
}

export function Search({ platform = 'personalized' }: SearchProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndex[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Fetch the search index when the component mounts
    const fetchSearchIndex = async () => {
        const index = await getSearchIndex();
        setSearchIndex(index);
    };
    fetchSearchIndex();
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
    if (query.length > 0) {
      // 1. Perform instant local search
      const lowerCaseQuery = query.toLowerCase();
      const localResults = searchIndex
        .flatMap(item => [item.name, item.category]) // Exclude vendor from local suggestions
        .filter((value): value is string => !!value)
        .filter(value => value.toLowerCase().includes(lowerCaseQuery));
      
      const uniqueLocalSuggestions = Array.from(new Set(localResults)).slice(0, 5);
      setSuggestions(uniqueLocalSuggestions);
      setShowSuggestions(true);

      // 2. Fetch AI suggestions in the background
      const fetchAiSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
          const result = await getSearchSuggestions({ query, products: searchIndex });
          // Combine and de-duplicate, giving preference to AI results
          const combined = Array.from(new Set([...result.suggestions, ...uniqueLocalSuggestions]));
          setSuggestions(combined.slice(0, 7));
        } catch (error) {
          console.error('Error fetching AI suggestions:', error);
          // Keep local suggestions if AI fails
        }
        setLoadingSuggestions(false);
      };

      const debounce = setTimeout(fetchAiSuggestions, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchPath = platform === 'corporate' ? '/corporate/search' : '/search';
      router.push(`${searchPath}?q=${query}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    const searchPath = platform === 'corporate' ? '/corporate/search' : '/search';
    router.push(`${searchPath}?q=${suggestion}`);
    setShowSuggestions(false);
  };
  
  const placeholderText = isMobile ? "Search..." : "Search for gifts, categories, and more...";

  return (
    <div className="w-full max-w-lg relative" ref={searchContainerRef}>
      <form onSubmit={handleSearch}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholderText}
          className="pl-10 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
        {loadingSuggestions && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
      </form>
      {showSuggestions && (suggestions.length > 0) && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
            <li
                key={index}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                onClick={() => handleSuggestionClick(suggestion)}
            >
                {suggestion}
            </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
