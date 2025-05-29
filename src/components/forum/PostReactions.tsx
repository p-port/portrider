
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Heart, Laugh } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PostReactionsProps {
  postId: string;
}

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'helpful', icon: Heart, label: 'Helpful' },
  { type: 'funny', icon: Laugh, label: 'Funny' },
  { type: 'dislike', icon: ThumbsDown, label: 'Dislike' },
];

export function PostReactions({ postId }: PostReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reactions } = useQuery({
    queryKey: ['post-reactions', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userReaction } = useQuery({
    queryKey: ['user-reaction', postId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ reactionType }: { reactionType: string }) => {
      if (!user) throw new Error('Must be logged in');

      if (userReaction) {
        if (userReaction.reaction_type === reactionType) {
          // Remove reaction
          const { error } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', userReaction.id);
          if (error) throw error;
        } else {
          // Update reaction
          const { error } = await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', userReaction.id);
          if (error) throw error;
        }
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postId] });
      queryClient.invalidateQueries({ queryKey: ['user-reaction', postId, user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  });

  const getReactionCount = (type: string) => {
    return reactions?.filter(r => r.reaction_type === type).length || 0;
  };

  const handleReaction = (reactionType: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to react to posts",
        variant: "destructive"
      });
      return;
    }
    
    reactionMutation.mutate({ reactionType });
  };

  return (
    <div className="flex items-center space-x-2">
      {reactionTypes.map(({ type, icon: Icon, label }) => {
        const count = getReactionCount(type);
        const isActive = userReaction?.reaction_type === type;
        
        return (
          <Button
            key={type}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleReaction(type)}
            className="flex items-center space-x-1"
          >
            <Icon className="h-4 w-4" />
            <span>{count}</span>
          </Button>
        );
      })}
    </div>
  );
}
