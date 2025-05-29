
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MotorcycleCard } from './MotorcycleCard';
import { AddMotorcycleDialog } from './AddMotorcycleDialog';
import { MaintenanceTracker } from './MaintenanceTracker';
import { GarageInsights } from './GarageInsights';
import { Plus, Bike } from 'lucide-react';

export function MyGarage() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: motorcycles = [], isLoading, refetch } = useQuery({
    queryKey: ['motorcycles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('motorcycles')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your garage...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bike className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">My Garage</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Motorcycle
        </Button>
      </div>

      <Tabs defaultValue="motorcycles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="motorcycles">Motorcycles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="motorcycles" className="space-y-6">
          {motorcycles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bike className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No motorcycles yet</h3>
                <p className="text-gray-500 mb-4 text-center">
                  Add your first motorcycle to start tracking maintenance and building your garage.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Motorcycle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {motorcycles.map((motorcycle) => (
                <MotorcycleCard
                  key={motorcycle.id}
                  motorcycle={motorcycle}
                  onUpdate={refetch}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTracker motorcycles={motorcycles} />
        </TabsContent>

        <TabsContent value="insights">
          <GarageInsights />
        </TabsContent>
      </Tabs>

      <AddMotorcycleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />
    </div>
  );
}
