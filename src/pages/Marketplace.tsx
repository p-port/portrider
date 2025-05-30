
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, Star, Package, ShoppingCart, ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['marketplace-businesses', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select(`
          *,
          reviews (rating)
        `)
        .eq('status', 'approved');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: userBusiness } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  const categories = [
    'all',
    'parts',
    'accessories',
    'gear',
    'services',
    'bikes',
    'tools'
  ];

  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-lg">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            </div>
            <div className="flex gap-2">
              {userBusiness && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/marketplace/manage-products')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/marketplace/manage-orders')}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                </>
              )}
              {user && (
                <Button onClick={() => navigate('/marketplace/register-business')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Business
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {businesses && businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={`/marketplace/business/${business.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{business.name}</CardTitle>
                        <Badge variant="secondary" className="mb-2 capitalize">
                          {business.category}
                        </Badge>
                        {business.location && (
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {business.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-muted-foreground">
                            {calculateAverageRating(business.reviews)} 
                            ({business.reviews?.length || 0} reviews)
                          </span>
                        </div>
                      </div>
                      {business.logo_url && (
                        <img 
                          src={business.logo_url} 
                          alt={business.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {business.description}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">No businesses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to register your business!'}
            </p>
            {user && (
              <Button onClick={() => navigate('/marketplace/register-business')}>
                <Plus className="h-4 w-4 mr-2" />
                Register Business
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
