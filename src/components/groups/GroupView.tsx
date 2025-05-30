
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, Plus, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  join_type: 'open' | 'request' | 'invite';
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  created_by: string;
  participant_count?: number;
}

interface GroupViewProps {
  group: Group;
  onBack: () => void;
}

export const GroupView: React.FC<GroupViewProps> = ({ group, onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchEvents();
    checkMembership();
  }, [group.id]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('group_events')
        .select('*')
        .eq('group_id', group.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const checkMembership = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      setIsMember(!!data);
    } catch (error) {
      // Not a member
      setIsMember(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;

    setIsJoining(true);
    try {
      const { error } = await supabase.rpc('join_open_group', {
        group_id_param: group.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You have joined the group!',
      });

      setIsMember(true);
      fetchMembers();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: 'Failed to join group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Button>

      {/* Group Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">{group.name}</CardTitle>
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
            {!isMember && group.join_type === 'open' && user && (
              <Button onClick={handleJoinGroup} disabled={isJoining}>
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{group.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {members.length} members
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">User {member.user_id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={member.role === 'leader' ? 'default' : 'outline'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No members yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-3">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
