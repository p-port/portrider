
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, User, DollarSign, Calendar, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { OrderDetails } from '@/components/marketplace/OrderDetails';

const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const ManageOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: userBusiness } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['business-orders', userBusiness?.id, selectedStatus],
    queryFn: async () => {
      if (!userBusiness) return [];
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              price,
              images
            )
          )
        `)
        .eq('business_id', userBusiness.id);

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userBusiness
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: { 
      orderId: string; 
      status: string; 
      trackingNumber?: string;
    }) => {
      const updateData: any = { status };
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['business-orders'] });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast.error('Failed to update order status');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'secondary';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (!userBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No approved business found</h2>
          <p className="text-gray-600">You need an approved business to manage orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
              <p className="text-gray-600 mt-2">{userBusiness.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">Loading orders...</div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getStatusColor(order.status)} className="capitalize">
                                {order.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-lg font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {order.total_amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_items?.length} item(s)
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">Customer: {order.buyer_id.slice(-8)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">
                              Ordered: {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {order.tracking_number && (
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">Tracking: {order.tracking_number}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(status) => updateOrderStatus.mutate({
                                orderId: order.id,
                                status
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {orderStatuses.map((status) => (
                                  <SelectItem key={status} value={status} className="capitalize">
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              placeholder="Tracking number"
                              defaultValue={order.tracking_number || ''}
                              onBlur={(e) => {
                                if (e.target.value !== order.tracking_number) {
                                  updateOrderStatus.mutate({
                                    orderId: order.id,
                                    status: order.status,
                                    trackingNumber: e.target.value
                                  });
                                }
                              }}
                            />

                            <Button
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {selectedStatus === 'all' 
                    ? 'You don\'t have any orders yet.' 
                    : `No ${selectedStatus} orders found.`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default ManageOrders;
