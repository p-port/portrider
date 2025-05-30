
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Coffee, Fuel, Utensils, Camera, Building } from 'lucide-react';

interface PitStop {
  id: string;
  name: string;
  type: string;
  description?: string;
  location: any;
  order_index: number;
}

interface RoutePitStopsProps {
  pitStops: PitStop[];
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'fuel':
      return <Fuel className="h-4 w-4" />;
    case 'food':
    case 'restaurant':
      return <Utensils className="h-4 w-4" />;
    case 'coffee':
      return <Coffee className="h-4 w-4" />;
    case 'scenic':
    case 'viewpoint':
      return <Camera className="h-4 w-4" />;
    case 'rest':
    case 'accommodation':
      return <Building className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'fuel':
      return 'bg-blue-100 text-blue-800';
    case 'food':
    case 'restaurant':
      return 'bg-green-100 text-green-800';
    case 'coffee':
      return 'bg-amber-100 text-amber-800';
    case 'scenic':
    case 'viewpoint':
      return 'bg-purple-100 text-purple-800';
    case 'rest':
    case 'accommodation':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const RoutePitStops: React.FC<RoutePitStopsProps> = ({ pitStops }) => {
  if (!pitStops || pitStops.length === 0) {
    return null;
  }

  // Sort pit stops by order_index
  const sortedPitStops = [...pitStops].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pit Stops
          <Badge variant="secondary">{pitStops.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPitStops.map((pitStop, index) => (
            <div key={pitStop.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{pitStop.name}</h4>
                  <Badge className={getTypeBadgeColor(pitStop.type)}>
                    <span className="flex items-center gap-1">
                      {getTypeIcon(pitStop.type)}
                      {pitStop.type}
                    </span>
                  </Badge>
                </div>
                {pitStop.description && (
                  <p className="text-sm text-muted-foreground">{pitStop.description}</p>
                )}
                {pitStop.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {pitStop.location.address || 
                       `${pitStop.location.lat?.toFixed(4)}, ${pitStop.location.lng?.toFixed(4)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
