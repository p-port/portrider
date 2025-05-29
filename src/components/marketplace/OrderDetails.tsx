
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, MapPin, Calendar, DollarSign, Truck } from 'lucide-react';

interface OrderDetailsProps {
  order: any;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order.id.slice(-8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Order Status
                <Badge variant={getStatusColor(order.status)} className="capitalize">
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Order Date</div>
                    <div className="font-medium">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="font-medium">${order.total_amount}</div>
                  </div>
                </div>
              </div>
              
              {order.tracking_number && (
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Tracking Number</div>
                    <div className="font-medium">{order.tracking_number}</div>
                  </div>
                </div>
              )}

              {order.shipping_method && (
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Shipping Method</div>
                    <div className="font-medium">{order.shipping_method}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Customer ID</div>
                  <div className="font-medium">{order.buyer_id}</div>
                </div>
                
                {order.shipping_address && (
                  <div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Shipping Address
                    </div>
                    <div className="font-medium">
                      {typeof order.shipping_address === 'string' 
                        ? order.shipping_address 
                        : JSON.stringify(order.shipping_address, null, 2)}
                    </div>
                  </div>
                )}

                {order.delivery_instructions && (
                  <div>
                    <div className="text-sm text-gray-500">Delivery Instructions</div>
                    <div className="font-medium">{order.delivery_instructions}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      {item.product?.images?.[0] && (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.product?.title}</div>
                        <div className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </div>
                        {item.variation && (
                          <div className="text-sm text-gray-500">
                            Variation: {JSON.stringify(item.variation)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.price}</div>
                      <div className="text-sm text-gray-500">
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
