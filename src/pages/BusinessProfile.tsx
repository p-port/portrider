
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BusinessProfile = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          reviews (
            id,
            rating,
            comment,
            created_at,
            profiles (username, first_name, last_name)
          )
        `)
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['business-products', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId
  });

  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading business...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Business not found</h2>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === business.owner_id;
  const averageRating = calculateAverageRating(business.reviews);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/marketplace')}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Marketplace</span>
          </Button>

          <div className="flex items-start space-x-6">
            {business.logo_url && (
              <img 
                src={business.logo_url} 
                alt={business.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  <Badge variant="secondary" className="mb-2 capitalize">
                    {business.category}
                  </Badge>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {business.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {business.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {averageRating} ({business.reviews?.length || 0} reviews)
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <Button onClick={() => navigate(`/marketplace/business/${businessId}/manage`)}>
                    Manage Business
                  </Button>
                )}
              </div>
            </div>
          </div>

          {business.description && (
            <p className="text-gray-600 mt-4 max-w-4xl">{business.description}</p>
          )}

          <div className="flex space-x-6 mt-4 text-sm">
            {business.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {business.phone}
              </div>
            )}
            {business.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {business.email}
              </div>
            )}
            {business.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          ${product.price}
                        </span>
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {product.stock_quantity} in stock
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {product.description}
                      </p>
                      <Button className="w-full">View Product</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500">This business hasn't added any products.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {business.reviews && business.reviews.length > 0 ? (
              <div className="space-y-4">
                {business.reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="font-medium">
                            {review.profiles?.username || 
                             `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.trim() ||
                             'Anonymous'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this business!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfile;
