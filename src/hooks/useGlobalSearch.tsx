
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'route' | 'forum_post' | 'business' | 'product';
  url: string;
  metadata?: {
    difficulty?: string;
    category?: string;
    price?: number;
    location?: string;
  };
}

export function useGlobalSearch(searchTerm: string) {
  const [isOpen, setIsOpen] = useState(false);

  // Fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Simple fuzzy matching - allows for character insertions
    let queryIndex = 0;
    for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === normalizedQuery.length;
  };

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const results: SearchResult[] = [];

      // Search routes
      const { data: routes } = await supabase
        .from('routes')
        .select('id, title, description, difficulty_level')
        .eq('is_active', true)
        .limit(10);

      if (routes) {
        routes.forEach(route => {
          if (fuzzyMatch(route.title, searchTerm) || fuzzyMatch(route.description || '', searchTerm)) {
            results.push({
              id: route.id,
              title: route.title,
              description: route.description || '',
              type: 'route',
              url: `/twisties`,
              metadata: {
                difficulty: route.difficulty_level
              }
            });
          }
        });
      }

      // Search forum posts
      const { data: posts } = await supabase
        .from('forum_posts')
        .select('id, title, content, forum_categories(name)')
        .limit(10);

      if (posts) {
        posts.forEach(post => {
          if (fuzzyMatch(post.title, searchTerm) || fuzzyMatch(post.content || '', searchTerm)) {
            results.push({
              id: post.id,
              title: post.title,
              description: post.content ? post.content.substring(0, 100) + '...' : '',
              type: 'forum_post',
              url: `/forum/post/${post.id}`,
              metadata: {
                category: (post.forum_categories as any)?.name
              }
            });
          }
        });
      }

      // Search businesses
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, description, location')
        .limit(10);

      if (businesses) {
        businesses.forEach(business => {
          if (fuzzyMatch(business.name, searchTerm) || fuzzyMatch(business.description || '', searchTerm)) {
            results.push({
              id: business.id,
              title: business.name,
              description: business.description || '',
              type: 'business',
              url: `/marketplace/business/${business.id}`,
              metadata: {
                location: business.location
              }
            });
          }
        });
      }

      // Search products - using 'title' instead of 'name'
      const { data: products } = await supabase
        .from('products')
        .select('id, title, description, price, businesses(name)')
        .eq('is_active', true)
        .limit(10);

      if (products) {
        products.forEach(product => {
          if (fuzzyMatch(product.title, searchTerm) || fuzzyMatch(product.description || '', searchTerm)) {
            results.push({
              id: product.id,
              title: product.title,
              description: product.description || '',
              type: 'product',
              url: `/marketplace`,
              metadata: {
                price: product.price
              }
            });
          }
        });
      }

      return results.slice(0, 20); // Limit total results
    },
    enabled: searchTerm.length >= 2,
  });

  const filteredResults = useMemo(() => {
    if (!searchTerm) return [];
    return searchResults;
  }, [searchResults, searchTerm]);

  return {
    searchResults: filteredResults,
    isLoading,
    isOpen,
    setIsOpen
  };
}
