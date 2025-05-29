
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Pin, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { PostReactions } from '@/components/forum/PostReactions';
import { CommentsList } from '@/components/forum/CommentsList';
import { CommentForm } from '@/components/forum/CommentForm';

const ForumPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['forum-post', postId],
    queryFn: async () => {
      // First get the post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories (
            name
          )
        `)
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      // Then get the author profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, first_name, last_name, avatar_url')
        .eq('id', postData.author_id)
        .single();
      
      if (profileError) {
        console.warn('Could not fetch profile for author:', profileError);
      }
      
      return {
        ...postData,
        profiles: profileData
      };
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Post not found</div>;
  }

  const authorName = post.profiles?.username || 
    `${post.profiles?.first_name || ''} ${post.profiles?.last_name || ''}`.trim() || 
    'Anonymous';

  const isAdmin = profile?.role === 'admin';
  const isSupport = profile?.role === 'support';
  const canModerate = isAdmin || isSupport;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/forum/category/${post.category_id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {post.forum_categories?.name}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            {post.is_pinned && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Pin className="h-3 w-3" />
                <span>Pinned</span>
              </Badge>
            )}
            {post.is_locked && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Locked</span>
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>by {authorName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{authorName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at))} ago
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
            
            <PostReactions postId={post.id} />
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {!post.is_locked && user && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Reply</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {showCommentForm && !post.is_locked && (
          <CommentForm 
            postId={post.id}
            onSubmit={() => setShowCommentForm(false)}
            onCancel={() => setShowCommentForm(false)}
          />
        )}
        
        <CommentsList postId={post.id} />
      </div>
    </div>
  );
};

export default ForumPost;
