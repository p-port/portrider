
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInputSanitization } from './useInputSanitization';

interface SecureQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface SecureMutationOptions {
  mutationFn: (data: any) => Promise<any>;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: string[][];
}

export function useSecureQuery({ queryKey, queryFn, onError, enabled = true }: SecureQueryOptions) {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        onError?.(error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive',
        });
      },
    },
  });
}

export function useSecureMutation({ mutationFn, onSuccess, onError, invalidateQueries }: SecureMutationOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { sanitizeFormData } = useInputSanitization();

  return useMutation({
    mutationFn: async (data: any) => {
      // Sanitize input data before sending
      const sanitizedData = sanitizeFormData(data);
      console.log('Mutation data (sanitized):', sanitizedData);
      return mutationFn(sanitizedData);
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      onSuccess?.(data);
      
      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      onError?.(error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('violates row-level security')
        ? 'You do not have permission to perform this action.'
        : error.message.includes('duplicate key')
        ? 'This item already exists.'
        : error.message.includes('foreign key')
        ? 'Referenced item does not exist.'
        : 'An error occurred. Please try again.';
        
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
