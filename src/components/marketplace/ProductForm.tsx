
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, X } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'parts',
  'accessories',
  'gear',
  'services',
  'bikes',
  'tools'
];

interface ProductFormProps {
  business: any;
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ business, product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    promotional_price: '',
    promotion_start: '',
    promotion_end: '',
    stock_quantity: '0',
    category: '',
    images: [] as string[],
    is_active: true
  });

  const [variants, setVariants] = useState<Array<{
    name: string;
    value: string;
    price_adjustment: string;
    stock_quantity: string;
    sku: string;
  }>>([]);

  const [bulkDiscounts, setBulkDiscounts] = useState<Array<{
    min_qty: string;
    discount_percent: string;
  }>>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        promotional_price: product.promotional_price?.toString() || '',
        promotion_start: product.promotion_start || '',
        promotion_end: product.promotion_end || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        category: product.category || '',
        images: product.images || [],
        is_active: product.is_active ?? true
      });

      if (product.product_variants) {
        setVariants(product.product_variants.map((v: any) => ({
          name: v.name,
          value: v.value,
          price_adjustment: v.price_adjustment?.toString() || '0',
          stock_quantity: v.stock_quantity?.toString() || '0',
          sku: v.sku || ''
        })));
      }

      if (product.bulk_discount_tiers) {
        setBulkDiscounts(product.bulk_discount_tiers.map((d: any) => ({
          min_qty: d.min_qty?.toString() || '',
          discount_percent: d.discount_percent?.toString() || ''
        })));
      }
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const productData = {
        business_id: business.id,
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        promotional_price: data.promotional_price ? parseFloat(data.promotional_price) : null,
        promotion_start: data.promotion_start || null,
        promotion_end: data.promotion_end || null,
        stock_quantity: parseInt(data.stock_quantity),
        category: data.category,
        images: data.images,
        is_active: data.is_active,
        bulk_discount_tiers: bulkDiscounts.length > 0 ? bulkDiscounts.map(d => ({
          min_qty: parseInt(d.min_qty),
          discount_percent: parseFloat(d.discount_percent)
        })) : null
      };

      let productId = product?.id;

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (error) throw error;
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        
        if (error) throw error;
        productId = newProduct.id;
      }

      // Handle variants
      if (variants.length > 0) {
        // Delete existing variants if updating
        if (product) {
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', product.id);
        }

        // Insert new variants
        const variantData = variants.map(v => ({
          product_id: productId,
          name: v.name,
          value: v.value,
          price_adjustment: parseFloat(v.price_adjustment),
          stock_quantity: parseInt(v.stock_quantity),
          sku: v.sku || null
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData);
        
        if (variantError) throw variantError;
      }
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save product');
    }
  });

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      value: '',
      price_adjustment: '0',
      stock_quantity: '0',
      sku: ''
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addBulkDiscount = () => {
    setBulkDiscounts([...bulkDiscounts, {
      min_qty: '',
      discount_percent: ''
    }]);
  };

  const removeBulkDiscount = (index: number) => {
    setBulkDiscounts(bulkDiscounts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotional_price">Promotional Price</Label>
              <Input
                id="promotional_price"
                type="number"
                step="0.01"
                value={formData.promotional_price}
                onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Product Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div>
                    <Label>Name</Label>
                    <Input
                      placeholder="Size, Color, etc."
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].name = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      placeholder="Large, Red, etc."
                      value={variant.value}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].value = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Price Adjustment</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price_adjustment}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].price_adjustment = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].stock_quantity = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bulk Discounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Bulk Discount Tiers</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addBulkDiscount}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkDiscounts.map((discount, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                  <div>
                    <Label>Minimum Quantity</Label>
                    <Input
                      type="number"
                      value={discount.min_qty}
                      onChange={(e) => {
                        const newDiscounts = [...bulkDiscounts];
                        newDiscounts[index].min_qty = e.target.value;
                        setBulkDiscounts(newDiscounts);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Discount Percentage</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discount.discount_percent}
                      onChange={(e) => {
                        const newDiscounts = [...bulkDiscounts];
                        newDiscounts[index].discount_percent = e.target.value;
                        setBulkDiscounts(newDiscounts);
                      }}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeBulkDiscount(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
