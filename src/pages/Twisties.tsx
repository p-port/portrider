import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Mountain } from 'lucide-react';
import { CreateRouteDialog } from '@/components/twisties/CreateRouteDialog';
import { RouteCard } from '@/components/twisties/RouteCard';

const Twisties = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ['routes', searchTerm, difficultyFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('routes')
        .select(`
          *,
          profiles!routes_created_by_fkey(username, first_name, last_name)
        `)
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter);
      }

      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'distance_asc':
          query = query.order('distance_km', { ascending: true });
          break;
        case 'distance_desc':
          query = query.order('distance_km', { ascending: false });
          break;
        case 'difficulty':
          query = query.order('difficulty_level', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.log('Supabase query error:', error);
        throw error;
      }
      
      // Transform the data to handle cases where profile data might be missing or is an error
      return data?.map(route => {
        // Initialize default profile data
        const defaultProfileData = { username: null, first_name: null, last_name: null };
        
        // Check if profiles exists and is not an error object
        let profileData = defaultProfileData;
        const profiles = route.profiles;
        if (profiles !== null && 
            typeof profiles === 'object' && 
            !('error' in profiles)) {
          profileData = profiles as { username: string | null; first_name: string | null; last_name: string | null };
        }
        
        return {
          ...route,
          profiles: profileData
        };
      }) || [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Twisties</h1>
          <p className="text-muted-foreground">
            Discover and share amazing motorcycle routes with the community
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit Route
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="distance_asc">Distance (Low to High)</SelectItem>
                <SelectItem value="distance_desc">Distance (High to Low)</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : routes && routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No routes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || difficultyFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Be the first to submit a route!'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Submit the First Route
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateRouteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onRouteCreated={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Twisties;
