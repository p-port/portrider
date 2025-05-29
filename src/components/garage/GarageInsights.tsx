
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, DollarSign, Wrench, Calendar } from 'lucide-react';

const chartConfig = {
  cost: {
    label: "Total Cost",
    color: "hsl(var(--chart-1))",
  },
};

export function GarageInsights() {
  const { user } = useAuth();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['garage_insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's motorcycles
      const { data: motorcycles } = await supabase
        .from('motorcycles')
        .select('id, make, model, year')
        .eq('owner_id', user.id);

      if (!motorcycles || motorcycles.length === 0) return null;

      const motorcycleIds = motorcycles.map(m => m.id);

      // Get maintenance records
      const { data: records } = await supabase
        .from('maintenance_records')
        .select('*')
        .in('motorcycle_id', motorcycleIds);

      if (!records) return null;

      // Calculate insights
      const totalRecords = records.length;
      const totalCost = records.reduce((sum, record) => sum + (Number(record.cost) || 0), 0);
      const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0;

      // Group by month for chart
      const monthlyData = records.reduce((acc, record) => {
        const month = new Date(record.date_performed).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { month, cost: 0, count: 0 };
        }
        acc[month].cost += Number(record.cost) || 0;
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { month: string; cost: number; count: number }>);

      const chartData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      // Most common maintenance types
      const maintenanceTypes = records.reduce((acc, record) => {
        const type = record.description.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topMaintenanceTypes = Object.entries(maintenanceTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }));

      return {
        totalRecords,
        totalCost,
        avgCost,
        chartData,
        topMaintenanceTypes,
        motorcycleCount: motorcycles.length,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No data available</h3>
          <p className="text-gray-500 text-center">
            Add motorcycles and maintenance records to see insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Garage Insights</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Motorcycles</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.motorcycleCount}</div>
            <p className="text-xs text-muted-foreground">In your garage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalRecords}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights.totalCost)}</div>
            <p className="text-xs text-muted-foreground">On maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights.avgCost)}</div>
            <p className="text-xs text-muted-foreground">Per maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cost" fill="var(--color-cost)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Common Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.topMaintenanceTypes.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="capitalize">{item.type}</span>
                </div>
                <Badge>{item.count} times</Badge>
              </div>
            ))}
            {insights.topMaintenanceTypes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No maintenance data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
