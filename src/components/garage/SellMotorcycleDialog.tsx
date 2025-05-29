
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SecureInput } from '@/components/forms/SecureInput';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCalculateValuation, useCreateListing, useMotorcycleValuation } from '@/hooks/useMarketplace';
import { Calculator, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const sellMotorcycleSchema = z.object({
  asking_price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().optional(),
  mileage: z.number().min(0).optional(),
  accident_history: z.boolean(),
  condition_rating: z.number().min(1).max(10),
  modifications: z.string().optional(),
});

type SellMotorcycleFormData = z.infer<typeof sellMotorcycleSchema>;

interface SellMotorcycleDialogProps {
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
  serviceRecordsCount: number;
  onSuccess: () => void;
}

export function SellMotorcycleDialog({
  open,
  onOpenChange,
  motorcycle,
  serviceRecordsCount,
  onSuccess,
}: SellMotorcycleDialogProps) {
  const { toast } = useToast();
  const [modifications, setModifications] = useState<string[]>([]);
  const [currentMod, setCurrentMod] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const { data: existingValuation } = useMotorcycleValuation(motorcycle.id);
  const calculateValuation = useCalculateValuation();
  const createListing = useCreateListing();

  const form = useForm<SellMotorcycleFormData>({
    resolver: zodResolver(sellMotorcycleSchema),
    defaultValues: {
      asking_price: 0,
      description: '',
      mileage: undefined,
      accident_history: false,
      condition_rating: 7,
      modifications: '',
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (existingValuation) {
      setCalculatedValue(existingValuation.final_recommended_value);
      if (!form.getValues('asking_price')) {
        form.setValue('asking_price', existingValuation.final_recommended_value);
      }
    }
  }, [existingValuation, form]);

  const handleCalculateValue = async () => {
    const values = form.getValues();
    try {
      const value = await calculateValuation.mutateAsync({
        motorcycleId: motorcycle.id,
        mileage: values.mileage,
        conditionRating: values.condition_rating,
        accidentHistory: values.accident_history,
        serviceRecordsCount,
        modifications,
      });
      setCalculatedValue(value);
      form.setValue('asking_price', value);
    } catch (error) {
      console.error('Failed to calculate valuation:', error);
    }
  };

  const addModification = () => {
    if (currentMod.trim() && !modifications.includes(currentMod.trim())) {
      setModifications([...modifications, currentMod.trim()]);
      setCurrentMod('');
    }
  };

  const removeModification = (mod: string) => {
    setModifications(modifications.filter(m => m !== mod));
  };

  const onSubmit = async (data: SellMotorcycleFormData) => {
    try {
      await createListing.mutateAsync({
        motorcycle_id: motorcycle.id,
        asking_price: data.asking_price,
        recommended_price: calculatedValue || undefined,
        description: data.description || null,
        status: 'active',
        mileage: data.mileage || null,
        accident_history: data.accident_history,
        service_records_count: serviceRecordsCount,
        modifications: modifications.length > 0 ? modifications : null,
        condition_rating: data.condition_rating,
      });
      
      onSuccess();
      onOpenChange(false);
      form.reset();
      setModifications([]);
      setCalculatedValue(null);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  const displayName = motorcycle.nickname || `${motorcycle.make} ${motorcycle.model}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sell {displayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valuation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Market Valuation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mileage</label>
                  <SecureInput
                    type="number"
                    placeholder="Enter mileage"
                    value={watchedValues.mileage || ''}
                    onChange={(e) => form.setValue('mileage', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Condition (1-10)</label>
                  <SecureInput
                    type="number"
                    min="1"
                    max="10"
                    value={watchedValues.condition_rating || 7}
                    onChange={(e) => form.setValue('condition_rating', parseInt(e.target.value) || 7)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accident_history"
                  checked={watchedValues.accident_history}
                  onCheckedChange={(checked) => form.setValue('accident_history', !!checked)}
                />
                <label htmlFor="accident_history" className="text-sm font-medium">
                  Has accident history
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Modifications</label>
                <div className="flex gap-2 mt-1">
                  <SecureInput
                    placeholder="Add modification"
                    value={currentMod}
                    onChange={(e) => setCurrentMod(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModification())}
                  />
                  <Button type="button" onClick={addModification} size="sm">
                    Add
                  </Button>
                </div>
                {modifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {modifications.map((mod, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeModification(mod)}>
                        {mod} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="button" 
                onClick={handleCalculateValue}
                disabled={calculateValuation.isPending}
                className="w-full"
              >
                {calculateValuation.isPending ? 'Calculating...' : 'Calculate Market Value'}
              </Button>

              {calculatedValue && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Recommended Market Value</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    ${calculatedValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Based on {serviceRecordsCount} service records and provided factors
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Listing Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="asking_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asking Price ($)</FormLabel>
                    <FormControl>
                      <SecureInput
                        type="number"
                        placeholder="Enter your asking price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your motorcycle's condition, features, or any additional details..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {calculatedValue && form.getValues('asking_price') !== calculatedValue && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Price differs from market value</span>
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Your asking price is {form.getValues('asking_price') > calculatedValue ? 'above' : 'below'} the recommended market value of ${calculatedValue.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createListing.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createListing.isPending}>
                  {createListing.isPending ? 'Creating Listing...' : 'List for Sale'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
