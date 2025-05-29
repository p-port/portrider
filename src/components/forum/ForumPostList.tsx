
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumPostCard } from './ForumPostCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ForumPostListProps {
  categoryId: string;
}

export function ForumPostList({ categoryId }: ForumPostListProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['forum-posts', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:author_id (
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts in this category yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
