
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { ForumPostList } from '@/components/forum/ForumPostList';
import { CreatePostDialog } from '@/components/forum/CreatePostDialog';
import { useAuth } from '@/hooks/useAuth';

const ForumCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: category } = useQuery({
    queryKey: ['forum-category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/forum')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Forum</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category?.name}</h1>
                {category?.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>
            </div>
            
            {user && (
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Post</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {categoryId && <ForumPostList categoryId={categoryId} />}
      </div>
      
      {showCreatePost && categoryId && (
        <CreatePostDialog 
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          categoryId={categoryId}
        />
      )}
    </div>
  );
};

export default ForumCategory;
