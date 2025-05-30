import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { GroupView } from '@/components/groups/GroupView';

interface Group {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  join_type: 'open' | 'request' | 'invite';
  created_at: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [joinTypeFilter, setJoinTypeFilter] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ['groups', searchTerm, joinTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(count),
          group_events!inner(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (joinTypeFilter !== 'all') {
        query = query.eq('join_type', joinTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    },
  });

  const { data: userMemberships } = useQuery({
    queryKey: ['user-memberships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(m => m.group_id) || [];
    },
    enabled: !!user,
  });

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to join groups.',
        variant: 'destructive',
      });
      return;
    }

    setJoiningGroupId(groupId);
    try {
      const { error } = await supabase.rpc('join_open_group', {
        group_id_param: groupId
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You have joined the group!',
      });

      refetch();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: 'Failed to join group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJoiningGroupId(null);
    }
  };

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <GroupView 
            group={selectedGroup} 
            onBack={() => setSelectedGroup(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Groups / Clubs</h1>
                <p className="text-muted-foreground">Join motorcycle groups and clubs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Create Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Discover Groups</h2>
            <p className="text-muted-foreground">Connect with fellow riders in your area</p>
          </div>
          <CreateGroupDialog onGroupCreated={refetch} />
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={joinTypeFilter} onValueChange={setJoinTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Join Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Join Types</SelectItem>
                  <SelectItem value="open">Open Groups</SelectItem>
                  <SelectItem value="request">Request to Join</SelectItem>
                  <SelectItem value="invite">Invite Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={{
                  ...group,
                  join_type: group.join_type as 'open' | 'request' | 'invite',
                  member_count: group.group_members?.[0]?.count || 0,
                  upcoming_events: group.group_events?.[0]?.count || 0
                }}
                onJoin={handleJoinGroup}
                onView={setSelectedGroup}
                isJoining={joiningGroupId === group.id}
                isMember={userMemberships?.includes(group.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || joinTypeFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Be the first to create a motorcycle group!'}
              </p>
              <CreateGroupDialog onGroupCreated={refetch} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Groups;
