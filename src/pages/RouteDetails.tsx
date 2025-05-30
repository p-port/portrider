import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Mountain, User, Star, Calendar } from 'lucide-react';
import { RoutePhotos } from '@/components/twisties/RoutePhotos';
import { RoutePitStops } from '@/components/twisties/RoutePitStops';
import { RouteDangerZones } from '@/components/twisties/RouteDangerZones';

interface RouteDetailsData {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  distance_km: number | null;
  estimated_duration_hours: number | null;
  start_point: any;
  end_point: any;
  created_at: string;
  created_by: string;
  profiles: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  route_photos: any[];
  route_pit_stops: any[];
  route_danger_zones: any[];
}

const RouteDetails = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();

  const { data: route, isLoading, error } = useQuery({
    queryKey: ['route', routeId],
    queryFn: async () => {
      if (!routeId) throw new Error('Route ID is required');

      console.log('Fetching route details for:', routeId);

      // Get route details with related data
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select(`
          *,
          route_photos(*),
          route_pit_stops(*),
          route_danger_zones(*)
        `)
        .eq('id', routeId)
        .eq('is_active', true)
        .single();

      if (routeError) {
        console.error('Route query error:', routeError);
        throw routeError;
      }

      if (!routeData) {
        throw new Error('Route not found');
      }

      // Get creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, first_name, last_name')
        .eq('id', routeData.created_by)
        .single();

      if (profileError) {
        console.error('Profile query error:', profileError);
      }

      const result: RouteDetailsData = {
        ...routeData,
        profiles: profileData || null
      };

      console.log('Route details loaded:', result);
      return result;
    },
    enabled: !!routeId,
  });

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  const getCreatorName = () => {
    if (!route?.profiles) return 'Unknown';
    const { username, first_name, last_name } = route.profiles;
    if (username) return username;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    if (first_name) return first_name;
    return 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBackClick = () => {
    navigate('/twisties');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Route not found</h3>
              <p className="text-muted-foreground mb-4">
                The route you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/twisties')}>
                Back to Twisties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{route.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <User className="h-4 w-4" />
                <span>by {getCreatorName()}</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(route.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Photos */}
            {route.route_photos && route.route_photos.length > 0 && (
              <RoutePhotos photos={route.route_photos} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Route Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {route.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Distance</p>
                      <p className="text-sm text-muted-foreground">
                        {route.distance_km ? `${route.distance_km} km` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {route.estimated_duration_hours ? `${route.estimated_duration_hours} hours` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pit Stops */}
            {route.route_pit_stops && route.route_pit_stops.length > 0 && (
              <RoutePitStops pitStops={route.route_pit_stops} />
            )}

            {/* Danger Zones */}
            {route.route_danger_zones && route.route_danger_zones.length > 0 && (
              <RouteDangerZones dangerZones={route.route_danger_zones} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span className="text-lg font-semibold">4.2</span>
                    <span className="text-sm text-muted-foreground">(12 reviews)</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Rating and review system coming soon!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Difficulty</p>
                  <Badge className={difficultyColors[route.difficulty_level as keyof typeof difficultyColors]}>
                    {route.difficulty_level}
                  </Badge>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Created by</p>
                  <p className="text-sm text-muted-foreground">{getCreatorName()}</p>
                </div>

                <div>
                  <p className="font-medium mb-1">Created on</p>
                  <p className="text-sm text-muted-foreground">{formatDate(route.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Save Route
                </Button>
                <Button className="w-full" variant="outline">
                  Share Route
                </Button>
                <Button className="w-full" variant="outline">
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
