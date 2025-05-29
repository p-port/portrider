
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Heart, Laugh } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PostReactionsProps {
  postId: string;
}

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'helpful', icon: Heart, label: 'Helpful' },
  { type: 'funny', icon: Laugh, label: 'Funny' },
];

export function PostReactions({ postId }: PostReactionsProps) {
  const { user } = useAuth();

  // Since we don't have the post_reactions table yet, we'll show disabled buttons
  return (
    <div className="flex items-center space-x-2">
      {reactionTypes.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          disabled
          className="flex items-center space-x-1 opacity-50"
          title="Reactions feature coming soon"
        >
          <Icon className="h-4 w-4" />
          <span>0</span>
        </Button>
      ))}
    </div>
  );
}
