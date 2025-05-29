
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bike, Calendar, Hash, Settings } from 'lucide-react';
import { AddMaintenanceDialog } from './AddMaintenanceDialog';
import { MotorcycleActions } from './MotorcycleActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MotorcycleCardProps {
  motorcycle: {
    id: string;
    make: string;
    model: string;
    year: number;
    nickname?: string;
    image_url?: string;
    vin?: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
  };
  onUpdate: () => void;
  onDelete?: () => void;
}

export function MotorcycleCard({ motorcycle, onUpdate, onDelete }: MotorcycleCardProps) {
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  // Fetch maintenance records count
  const { data: maintenanceCount = 0 } = useQuery({
    queryKey: ['maintenance-count', motorcycle.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('maintenance_records')
        .select('*', { count: 'exact', head: true })
        .eq('motorcycle_id', motorcycle.id);

      if (error) throw error;
      return count || 0;
    },
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const displayName = motorcycle.nickname || `${motorcycle.make} ${motorcycle.model}`;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Bike className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <CardTitle className="text-lg truncate">{displayName}</CardTitle>
            </div>
            <MotorcycleActions
              motorcycle={motorcycle}
              serviceRecordsCount={maintenanceCount}
              onUpdate={onUpdate}
              onDelete={handleDelete}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{motorcycle.year} {motorcycle.make} {motorcycle.model}</span>
            </div>

            {motorcycle.vin && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span className="font-mono text-xs">{motorcycle.vin}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline" className="text-xs">
              {maintenanceCount} service{maintenanceCount !== 1 ? 's' : ''}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMaintenanceDialog(true)}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Add Service
            </Button>
          </div>

          {motorcycle.image_url && (
            <div className="mt-4">
              <img
                src={motorcycle.image_url}
                alt={displayName}
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AddMaintenanceDialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
        motorcycleId={motorcycle.id}
        onSuccess={() => {
          onUpdate();
          setShowMaintenanceDialog(false);
        }}
      />
    </>
  );
}
