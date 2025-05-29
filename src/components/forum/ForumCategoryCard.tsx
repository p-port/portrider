
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

interface ForumCategoryCardProps {
  category: Tables<'forum_categories'>;
}

export function ForumCategoryCard({ category }: ForumCategoryCardProps) {
  const navigate = useNavigate();

  const { data: postCount } = useQuery({
    queryKey: ['category-post-count', category.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_hidden', false);
      
      return count || 0;
    }
  });

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/forum/category/${category.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category.name}</span>
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {category.description && (
          <p className="text-gray-600 mb-3">{category.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{postCount || 0} posts</span>
          <Users className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
