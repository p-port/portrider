
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Mountain, User } from 'lucide-react';

interface RouteCardProps {
  route: {
    id: string;
    title: string;
    description: string;
    difficulty_level: string;
    distance_km: number | null;
    estimated_duration_hours: number | null;
    created_at: string;
    profiles: {
      username: string | null;
      first_name: string | null;
      last_name: string | null;
    } | null;
  };
}

export const RouteCard = ({ route }: RouteCardProps) => {
  const navigate = useNavigate();

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  const getCreatorName = () => {
    if (!route.profiles) return 'Unknown';
    const { username, first_name, last_name } = route.profiles;
    if (username) return username;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    if (first_name) return first_name;
    return 'Unknown';
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/twisties/route/${route.id}`)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{route.title}</CardTitle>
          <Badge className={difficultyColors[route.difficulty_level as keyof typeof difficultyColors]}>
            {route.difficulty_level}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>by {getCreatorName()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {route.description}
        </p>
        
        <div className="space-y-2">
          {route.distance_km && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{route.distance_km} km</span>
            </div>
          )}
          
          {route.estimated_duration_hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{route.estimated_duration_hours} hours</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="text-sm">4.2</span>
              <span className="text-xs text-muted-foreground">(12 reviews)</span>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              navigate(`/twisties/route/${route.id}`);
            }}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
