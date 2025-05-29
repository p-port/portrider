
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddMaintenanceDialog } from './AddMaintenanceDialog';
import { Tables } from '@/integrations/supabase/types';
import { Plus, Wrench, Calendar, DollarSign } from 'lucide-react';

type Motorcycle = Tables<'motorcycles'>;
type MaintenanceRecord = Tables<'maintenance_records'>;

interface MaintenanceTrackerProps {
  motorcycles: Motorcycle[];
}

export function MaintenanceTracker({ motorcycles }: MaintenanceTrackerProps) {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string>('');

  const { data: maintenanceRecords = [], refetch } = useQuery({
    queryKey: ['maintenance_records', user?.id],
    queryFn: async () => {
      if (!user?.id || motorcycles.length === 0) return [];
      
      const motorcycleIds = motorcycles.map(m => m.id);
      
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          motorcycles!inner(make, model, year, nickname)
        `)
        .in('motorcycle_id', motorcycleIds)
        .order('date_performed', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && motorcycles.length > 0,
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddRecord = () => {
    if (motorcycles.length === 1) {
      setSelectedMotorcycleId(motorcycles[0].id);
      setShowAddDialog(true);
    } else {
      // For multiple motorcycles, we'll use the first one as default
      // In a real app, you might want to show a selection dialog first
      setSelectedMotorcycleId(motorcycles[0]?.id || '');
      setShowAddDialog(true);
    }
  };

  if (motorcycles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No motorcycles to track</h3>
          <p className="text-gray-500 text-center">
            Add a motorcycle first to start tracking maintenance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Maintenance Records</h2>
        <Button onClick={handleAddRecord}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {maintenanceRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No maintenance records yet</h3>
            <p className="text-gray-500 mb-4 text-center">
              Start tracking your motorcycle maintenance to build a comprehensive service history.
            </p>
            <Button onClick={handleAddRecord}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {maintenanceRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{record.description}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {(record.motorcycles as any)?.nickname || 
                        `${(record.motorcycles as any)?.year} ${(record.motorcycles as any)?.make} ${(record.motorcycles as any)?.model}`}
                    </p>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(record.date_performed)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {record.mileage && (
                    <div>
                      <span className="text-gray-500">Mileage:</span>
                      <p className="font-medium">{record.mileage.toLocaleString()} mi</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Cost:</span>
                    <p className="font-medium">{formatCurrency(record.cost)}</p>
                  </div>
                  {record.parts_used && (
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Parts Used:</span>
                      <p className="font-medium">{record.parts_used}</p>
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <div>
                    <span className="text-gray-500 text-sm">Notes:</span>
                    <p className="text-sm mt-1">{record.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMotorcycleId && (
        <AddMaintenanceDialog
          motorcycleId={selectedMotorcycleId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={() => {
            refetch();
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}
