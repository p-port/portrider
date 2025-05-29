
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Don't show button if not logged in or trying to follow yourself
  if (!user || user.id === userId) {
    return null;
  }

  // Check if already following
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['is-following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !!data;
    }
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', userId] });
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully');
    },
    onError: (error) => {
      console.error('Follow/unfollow error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  });

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="flex items-center space-x-1"
      >
        <UserPlus className="h-4 w-4" />
        <span>...</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending}
      className="flex items-center space-x-1"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </Button>
  );
}
