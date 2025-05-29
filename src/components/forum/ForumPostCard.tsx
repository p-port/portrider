
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Pin, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FollowButton } from './FollowButton';

interface ForumPostCardProps {
  post: any;
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const navigate = useNavigate();

  const { data: commentCount } = useQuery({
    queryKey: ['post-comment-count', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      return count || 0;
    }
  });

  const { data: reactionCount } = useQuery({
    queryKey: ['post-reaction-count', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      return count || 0;
    }
  });

  const authorName = post.profiles?.username || 
    `${post.profiles?.first_name || ''} ${post.profiles?.last_name || ''}`.trim() || 
    'Anonymous';

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/forum/post/${post.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
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
            <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>by {authorName}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton userId={post.author_id} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{commentCount || 0} comments</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{reactionCount || 0} reactions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
