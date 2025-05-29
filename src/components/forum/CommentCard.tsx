
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommentForm } from './CommentForm';

interface CommentCardProps {
  comment: any;
}

export function CommentCard({ comment }: CommentCardProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const authorName = comment.profiles?.username || 
    `${comment.profiles?.first_name || ''} ${comment.profiles?.last_name || ''}`.trim() || 
    'Anonymous';

  const isAuthor = user?.id === comment.author_id;
  const canModerate = profile?.role === 'admin' || profile?.role === 'support';
  const canEdit = isAuthor || canModerate;
  const canDelete = isAuthor || canModerate;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', comment.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', comment.post_id] });
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="ml-0">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm font-semibold">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{authorName}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </p>
            </div>
          </div>
          
          {(canEdit || canDelete) && (
            <div className="flex items-center space-x-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <CommentForm
            postId={comment.post_id}
            initialContent={comment.content}
            commentId={comment.id}
            onSubmit={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
            isEditing
          />
        ) : (
          <>
            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
            
            <div className="flex items-center space-x-2">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Reply</span>
                </Button>
              )}
            </div>
          </>
        )}
        
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              postId={comment.post_id}
              parentId={comment.id}
              onSubmit={() => setShowReplyForm(false)}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
