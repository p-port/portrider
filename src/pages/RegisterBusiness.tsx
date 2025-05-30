
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SecureInput, SecureTextarea } from '@/components/forms/SecureInput';
import { z } from 'zod';

const businessSchema = z.object({
  name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,&()]+$/, 'Business name contains invalid characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1,000 characters')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Location contains invalid characters')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[\d\s\-\(\)]{10,}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const RegisterBusiness = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    website: ''
  });
  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});

  const categories = [
    'parts',
    'accessories', 
    'gear',
    'services',
    'bikes',
    'tools'
  ];

  const validateForm = () => {
    try {
      businessSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<BusinessFormData> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof BusinessFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Ensure required fields are present and properly typed
      const businessData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        location: data.location || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        owner_id: user.id,
        status: 'pending' as const
      };

      const { error } = await supabase
        .from('businesses')
        .insert(businessData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Business registration submitted! It will be reviewed by our team.');
      navigate('/marketplace');
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Failed to register business. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (validateForm()) {
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to register a business</h2>
          <Button onClick={() => navigate('/auth')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/marketplace')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Marketplace</span>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Business</h1>
          <p className="text-gray-600 mt-2">
            Submit your business for approval to start selling in our marketplace
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <SecureInput
                    id="name"
                    value={formData.name}
                    onValueChange={(value) => handleInputChange('name', value)}
                    placeholder="Enter your business name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <SecureInput
                    id="location"
                    value={formData.location}
                    onValueChange={(value) => handleInputChange('location', value)}
                    placeholder="City, State"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <SecureInput
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onValueChange={(value) => handleInputChange('phone', value)}
                    placeholder="(555) 123-4567"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <SecureInput
                    id="email"
                    type="email"
                    value={formData.email}
                    onValueChange={(value) => handleInputChange('email', value)}
                    placeholder="business@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <SecureInput
                    id="website"
                    type="url"
                    value={formData.website}
                    onValueChange={(value) => handleInputChange('website', value)}
                    placeholder="https://www.yourbusiness.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <SecureTextarea
                  id="description"
                  value={formData.description}
                  onValueChange={(value) => handleInputChange('description', value)}
                  placeholder="Tell us about your business, what you sell, and what makes you special..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterBusiness;
