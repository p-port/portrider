
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isFollowing } = useQuery({
    queryKey: ['user-follow', user?.id, userId],
    queryFn: async () => {
      if (!user || user.id === userId) return false;
      
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && user.id !== userId
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
      } else {
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
      queryClient.invalidateQueries({ queryKey: ['user-follow', user?.id, userId] });
      toast({
        title: "Success",
        description: isFollowing ? "Unfollowed user" : "Following user"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  });

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
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
