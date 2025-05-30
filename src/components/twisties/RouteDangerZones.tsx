
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin } from 'lucide-react';

interface DangerZone {
  id: string;
  danger_type: string;
  severity: string;
  description: string;
  location: any;
}

interface RouteDangerZonesProps {
  dangerZones: DangerZone[];
}

const getSeverityBadgeColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    case 'medium':
    case 'moderate':
      return 'bg-orange-100 text-orange-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'extreme':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDangerTypeIcon = (type: string) => {
  return <AlertTriangle className="h-4 w-4" />;
};

export const RouteDangerZones: React.FC<RouteDangerZonesProps> = ({ dangerZones }) => {
  if (!dangerZones || dangerZones.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Danger Zones
          <Badge variant="secondary">{dangerZones.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dangerZones.map((zone) => (
            <div key={zone.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getDangerTypeIcon(zone.danger_type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium capitalize">{zone.danger_type.replace('_', ' ')}</h4>
                    <Badge className={getSeverityBadgeColor(zone.severity)}>
                      {zone.severity} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{zone.description}</p>
                  {zone.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {zone.location.address || 
                         `${zone.location.lat?.toFixed(4)}, ${zone.location.lng?.toFixed(4)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
