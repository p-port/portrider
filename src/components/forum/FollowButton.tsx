
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { user } = useAuth();

  // Don't show button if not logged in or trying to follow yourself
  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled
      className="flex items-center space-x-1 opacity-50"
      title="Follow feature coming soon"
    >
      <UserPlus className="h-4 w-4" />
      <span>Follow</span>
    </Button>
  );
}
