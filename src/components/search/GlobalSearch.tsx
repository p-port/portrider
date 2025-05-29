
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, MessageSquare, Store, Package, Mountain, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

const typeIcons = {
  route: Mountain,
  forum_post: MessageSquare,
  business: Store,
  product: Package
};

const typeLabels = {
  route: 'Route',
  forum_post: 'Forum Post',
  business: 'Business',
  product: 'Product'
};

const typeColors = {
  route: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  forum_post: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  business: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  product: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
};

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { searchResults, isLoading, isOpen, setIsOpen } = useGlobalSearch(searchTerm);

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Open search results when focused and has results
  useEffect(() => {
    if (isFocused && (searchResults.length > 0 || isLoading)) {
      setIsOpen(true);
    }
  }, [isFocused, searchResults.length, isLoading, setIsOpen]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setSearchTerm('');
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search routes, forums, marketplace..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 bg-background border-border focus:ring-2 focus:ring-primary/20"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-border">
                {searchResults.map((result) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <Button
                      key={`${result.type}-${result.id}`}
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto text-left hover:bg-muted/50"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground truncate">
                              {result.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className={cn("text-xs flex-shrink-0", typeColors[result.type])}
                            >
                              {typeLabels[result.type]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                          {result.metadata && (
                            <div className="flex items-center gap-2 mt-1">
                              {result.metadata.difficulty && (
                                <Badge variant="outline" className="text-xs">
                                  {result.metadata.difficulty}
                                </Badge>
                              )}
                              {result.metadata.category && (
                                <Badge variant="outline" className="text-xs">
                                  {result.metadata.category}
                                </Badge>
                              )}
                              {result.metadata.price && (
                                <Badge variant="outline" className="text-xs">
                                  ${result.metadata.price}
                                </Badge>
                              )}
                              {result.metadata.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {result.metadata.location}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No results found for "{searchTerm}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
