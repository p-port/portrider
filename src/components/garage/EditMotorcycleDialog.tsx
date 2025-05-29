
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SecureInput } from '@/components/forms/SecureInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const editMotorcycleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  nickname: z.string().optional(),
  vin: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

type EditMotorcycleFormData = z.infer<typeof editMotorcycleSchema>;

interface EditMotorcycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorcycle: {
    id: string;
    make: string;
    model: string;
    year: number;
    nickname?: string;
    image_url?: string;
    vin?: string;
    created_at: string;
    updated_at: string;
    owner_id: string;
  };
  onSuccess: () => void;
}

export function EditMotorcycleDialog({
  open,
  onOpenChange,
  motorcycle,
  onSuccess,
}: EditMotorcycleDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditMotorcycleFormData>({
    resolver: zodResolver(editMotorcycleSchema),
    defaultValues: {
      make: motorcycle.make,
      model: motorcycle.model,
      year: motorcycle.year,
      nickname: motorcycle.nickname || '',
      vin: motorcycle.vin || '',
      image_url: motorcycle.image_url || '',
    },
  });

  const onSubmit = async (data: EditMotorcycleFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('motorcycles')
        .update({
          make: data.make,
          model: data.model,
          year: data.year,
          nickname: data.nickname || null,
          vin: data.vin || null,
          image_url: data.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', motorcycle.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Motorcycle updated successfully.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating motorcycle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update motorcycle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Motorcycle</DialogTitle>
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
                    <SecureInput placeholder="Honda, Yamaha, etc." {...field} />
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
                    <SecureInput placeholder="CBR600RR, R1, etc." {...field} />
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
                      placeholder="2023"
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
                    <SecureInput placeholder="Lightning, Beast, etc." {...field} />
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
                    <SecureInput placeholder="Vehicle Identification Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <SecureInput placeholder="https://example.com/image.jpg" {...field} />
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Motorcycle'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
