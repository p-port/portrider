
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SecureInput } from '@/components/forms/SecureInput';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSecureMutation } from '@/hooks/useSecureQuery';
import { supabase } from '@/integrations/supabase/client';
import { motorcycleSchema } from '@/lib/validation';
import type { z } from 'zod';

type MotorcycleFormData = z.infer<typeof motorcycleSchema>;

interface AddMotorcycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMotorcycleDialog({ open, onOpenChange, onSuccess }: AddMotorcycleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      nickname: '',
      vin: '',
    },
  });

  const addMotorcycleMutation = useSecureMutation({
    mutationFn: async (data: MotorcycleFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Adding motorcycle with data:', data);
      
      const { data: result, error } = await supabase
        .from('motorcycles')
        .insert({
          make: data.make,
          model: data.model,
          year: data.year,
          nickname: data.nickname || null,
          vin: data.vin || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Motorcycle added successfully!',
      });
      form.reset();
      onSuccess();
    },
    invalidateQueries: [['motorcycles', user?.id]],
  });

  const onSubmit = (data: MotorcycleFormData) => {
    console.log('Form submitted with data:', data);
    addMotorcycleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Motorcycle</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <SecureInput placeholder="e.g., Honda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <SecureInput placeholder="e.g., CBR600RR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <SecureInput
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname (Optional)</FormLabel>
                  <FormControl>
                    <SecureInput placeholder="e.g., Red Rocket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN (Optional)</FormLabel>
                  <FormControl>
                    <SecureInput placeholder="17-character VIN" maxLength={17} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addMotorcycleMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addMotorcycleMutation.isPending}>
                {addMotorcycleMutation.isPending ? 'Adding...' : 'Add Motorcycle'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
