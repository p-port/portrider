
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoutePhoto {
  id: string;
  photo_url: string;
  caption?: string;
  order_index: number;
}

interface RoutePhotosProps {
  photos: RoutePhoto[];
}

export const RoutePhotos: React.FC<RoutePhotosProps> = ({ photos }) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  // Sort photos by order_index
  const sortedPhotos = [...photos].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Route Photos
          <Badge variant="secondary">{photos.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPhotos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Route photo'}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                />
              </div>
              {photo.caption && (
                <p className="text-sm text-muted-foreground">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
