
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { EditMotorcycleDialog } from './EditMotorcycleDialog';
import { Bike, Calendar, Settings, Trash } from 'lucide-react';

type Motorcycle = Tables<'motorcycles'>;

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  onUpdate: () => void;
}

export function MotorcycleCard({ motorcycle, onUpdate }: MotorcycleCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${motorcycle.nickname || `${motorcycle.year} ${motorcycle.make} ${motorcycle.model}`}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('motorcycles')
      .delete()
      .eq('id', motorcycle.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete motorcycle",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Motorcycle deleted successfully",
      });
      onUpdate();
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">
                {motorcycle.nickname || `${motorcycle.make} ${motorcycle.model}`}
              </CardTitle>
            </div>
            <Badge variant="secondary">{motorcycle.year}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {motorcycle.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={motorcycle.image_url}
                alt={`${motorcycle.make} ${motorcycle.model}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Make:</span>
              <span className="font-medium">{motorcycle.make}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model:</span>
              <span className="font-medium">{motorcycle.model}</span>
            </div>
            {motorcycle.vin && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">VIN:</span>
                <span className="font-mono text-xs">{motorcycle.vin}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditMotorcycleDialog
        motorcycle={motorcycle}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          onUpdate();
          setShowEditDialog(false);
        }}
      />
    </>
  );
}
