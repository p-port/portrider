
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Calendar } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  join_type: 'open' | 'request' | 'invite';
  created_at: string;
  member_count?: number;
  upcoming_events?: number;
}

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onView: (group: Group) => void;
  isJoining?: boolean;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  onJoin, 
  onView, 
  isJoining = false,
  isMember = false 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{group.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={group.join_type === 'open' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {group.join_type === 'open' ? 'Open to join' : group.join_type}
              </Badge>
              {isMember && (
                <Badge variant="outline">Member</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {group.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {group.member_count || 0} members
          </div>
          {group.upcoming_events !== undefined && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {group.upcoming_events} upcoming events
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(group)}
            className="flex-1"
          >
            View Details
          </Button>
          {!isMember && group.join_type === 'open' && (
            <Button 
              size="sm" 
              onClick={() => onJoin(group.id)}
              disabled={isJoining}
              className="flex-1"
            >
              {isJoining ? 'Joining...' : 'Join Group'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
