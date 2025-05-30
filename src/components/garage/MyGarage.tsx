
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MotorcycleCard } from './MotorcycleCard';
import { AddMotorcycleDialog } from './AddMotorcycleDialog';
import { MaintenanceTracker } from './MaintenanceTracker';
import { GarageInsights } from './GarageInsights';
import { Plus, Bike, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyGarage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleDeleteMotorcycle = async (motorcycleId: string) => {
    try {
      const { error } = await supabase
        .from('motorcycles')
        .delete()
        .eq('id', motorcycleId)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Motorcycle removed from garage successfully.',
      });

      refetch();
    } catch (error) {
      console.error('Error deleting motorcycle:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove motorcycle. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Mobile-first header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Back</span>
              </Button>
              <Bike className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">My Garage</h1>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Motorcycle</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs defaultValue="motorcycles" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="motorcycles" className="text-xs sm:text-sm py-2">
              Motorcycles
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs sm:text-sm py-2">
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm py-2">
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="motorcycles" className="space-y-4 sm:space-y-6">
            {motorcycles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <Bike className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No motorcycles yet</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 text-center max-w-md">
                    Add your first motorcycle to start tracking maintenance and building your garage.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Motorcycle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {motorcycles.map((motorcycle) => (
                  <MotorcycleCard
                    key={motorcycle.id}
                    motorcycle={motorcycle}
                    onUpdate={refetch}
                    onDelete={() => handleDeleteMotorcycle(motorcycle.id)}
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
    </div>
  );
}
