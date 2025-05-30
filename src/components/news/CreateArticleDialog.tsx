
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SecureInput, SecureTextarea } from '@/components/forms/SecureInput';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  content: z.string()
    .min(50, 'Content must be at least 50 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export const CreateArticleDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    imageUrl: '',
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [errors, setErrors] = useState<Partial<ArticleFormData>>({});

  const categories = [
    'industry',
    'releases', 
    'events',
    'reviews',
    'safety',
    'general'
  ];

  const validateForm = () => {
    try {
      articleSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<ArticleFormData> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ArticleFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || data.content.slice(0, 200) + '...',
          author_id: user.id,
          category: data.category,
          image_url: data.imageUrl || null,
          is_featured: isFeatured,
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Article created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      setOpen(false);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        imageUrl: '',
      });
      setIsFeatured(false);
      setIsPublished(false);
      setErrors({});
    },
    onError: (error) => {
      console.error('Error creating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to create article. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create News Article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <SecureInput
                id="title"
                value={formData.title}
                onValueChange={(value) => handleInputChange('title', value)}
                placeholder="Enter article title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <SecureInput
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onValueChange={(value) => handleInputChange('imageUrl', value)}
                placeholder="https://example.com/image.jpg"
                className={errors.imageUrl ? 'border-red-500' : ''}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <SecureTextarea
                id="excerpt"
                value={formData.excerpt}
                onValueChange={(value) => handleInputChange('excerpt', value)}
                placeholder="Brief summary of the article (optional)"
                rows={3}
                className={errors.excerpt ? 'border-red-500' : ''}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-500">{errors.excerpt}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Content *</Label>
              <SecureTextarea
                id="content"
                value={formData.content}
                onValueChange={(value) => handleInputChange('content', value)}
                placeholder="Write your article content here..."
                rows={10}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">Featured Article</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">Publish Immediately</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Article'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
