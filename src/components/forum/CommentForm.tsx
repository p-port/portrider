
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  commentId?: string;
  initialContent?: string;
  isEditing?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CommentForm({ 
  postId, 
  parentId, 
  commentId, 
  initialContent = '', 
  isEditing = false,
  onSubmit, 
  onCancel 
}: CommentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState(initialContent);

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      if (isEditing && commentId) {
        const { error } = await supabase
          .from('forum_comments')
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forum_comments')
          .insert({
            post_id: postId,
            author_id: user.id,
            content: content.trim(),
            parent_id: parentId || null
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
      setContent('');
      onSubmit();
      toast({
        title: "Success",
        description: isEditing ? "Comment updated successfully" : "Comment posted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update comment" : "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    commentMutation.mutate();
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <Textarea
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4"
          rows={3}
        />
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSubmit}
            disabled={commentMutation.isPending || !content.trim()}
          >
            {commentMutation.isPending ? 'Posting...' : (isEditing ? 'Update' : 'Post Comment')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
