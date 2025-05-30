import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SecureInput, SecureTextarea } from '@/components/forms/SecureInput';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,&()]+$/, 'Group name contains invalid characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1,000 characters'),
  joinType: z.enum(['open', 'request', 'invite'], {
    required_error: 'Please select a join type',
  }),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface CreateGroupDialogProps {
  onGroupCreated?: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ onGroupCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    joinType: 'request' as const,
  });
  const [errors, setErrors] = useState<Partial<GroupFormData>>({});

  const validateForm = () => {
    try {
      groupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<GroupFormData> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof GroupFormData;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description,
          leader_id: user.id,
          join_type: data.joinType,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Group created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onGroupCreated?.();
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        joinType: 'request' as const,
      });
      setErrors({});
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleJoinTypeChange = (value: string) => {
    // Ensure the value is one of the allowed types
    if (value === 'open' || value === 'request' || value === 'invite') {
      setFormData(prev => ({ ...prev, joinType: value }));
      if (errors.joinType) {
        setErrors(prev => ({ ...prev, joinType: undefined }));
      }
    }
  };

  if (!user) {
    return (
      <Button disabled>
        <Plus className="h-4 w-4 mr-2" />
        Create Group
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <SecureInput
                id="name"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                placeholder="Enter group name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinType">Join Type *</Label>
              <Select 
                value={formData.joinType} 
                onValueChange={handleJoinTypeChange}
              >
                <SelectTrigger className={errors.joinType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select join type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open - Anyone can join</SelectItem>
                  <SelectItem value="request">Request - Approval required</SelectItem>
                  <SelectItem value="invite">Invite Only - By invitation only</SelectItem>
                </SelectContent>
              </Select>
              {errors.joinType && (
                <p className="text-sm text-red-500">{errors.joinType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <SecureTextarea
                id="description"
                value={formData.description}
                onValueChange={(value) => handleInputChange('description', value)}
                placeholder="Describe your group, its purpose, and what members can expect..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
