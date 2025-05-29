
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

const maintenanceSchema = z.object({
  motorcycle_id: z.string().min(1, 'Please select a motorcycle'),
  description: z.string().min(1, 'Description is required'),
  date_performed: z.string().min(1, 'Date is required'),
  mileage: z.number().optional(),
  cost: z.number().optional(),
  parts_used: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceForm = z.infer<typeof maintenanceSchema>;
type Motorcycle = Tables<'motorcycles'>;

interface AddMaintenanceDialogProps {
  motorcycles: Motorcycle[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMaintenanceDialog({ motorcycles, open, onOpenChange, onSuccess }: AddMaintenanceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      motorcycle_id: '',
      description: '',
      date_performed: new Date().toISOString().split('T')[0],
      parts_used: '',
      notes: '',
    },
  });

  const onSubmit = async (data: MaintenanceForm) => {
    setLoading(true);
    const { error } = await supabase
      .from('maintenance_records')
      .insert([
        {
          ...data,
          mileage: data.mileage || null,
          cost: data.cost || null,
          parts_used: data.parts_used || null,
          notes: data.notes || null,
        },
      ]);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add maintenance record",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
      });
      form.reset();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motorcycle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motorcycle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a motorcycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motorcycles.map((motorcycle) => (
                        <SelectItem key={motorcycle.id} value={motorcycle.id}>
                          {motorcycle.nickname || `${motorcycle.year} ${motorcycle.make} ${motorcycle.model}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Oil change, tire replacement, etc..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_performed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Performed</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12345"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="99.99"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parts_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Used (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Oil filter, brake pads, etc..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the maintenance..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding..." : "Add Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
