
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceListing {
  id: string;
  motorcycle_id: string;
  seller_id: string;
  asking_price: number;
  recommended_price?: number;
  description?: string;
  images?: string[];
  status: 'active' | 'sold' | 'withdrawn';
  mileage?: number;
  accident_history: boolean;
  service_records_count: number;
  modifications?: string[];
  condition_rating?: number;
  created_at: string;
  updated_at: string;
  motorcycles?: {
    make: string;
    model: string;
    year: number;
    nickname?: string;
  };
}

export interface MotorcycleValuation {
  id: string;
  motorcycle_id: string;
  base_value: number;
  final_recommended_value: number;
  mileage_adjustment: number;
  condition_adjustment: number;
  service_history_adjustment: number;
  accident_history_adjustment: number;
  modifications_adjustment: number;
  calculated_at: string;
  factors_used: any;
}

export function useMarketplaceListings() {
  return useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          motorcycles(make, model, year, nickname)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketplaceListing[];
    },
  });
}

export function useUserListings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-listings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          motorcycles(make, model, year, nickname)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketplaceListing[];
    },
    enabled: !!user?.id,
  });
}

export function useMotorcycleValuation(motorcycleId: string) {
  return useQuery({
    queryKey: ['motorcycle-valuation', motorcycleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motorcycle_valuations')
        .select('*')
        .eq('motorcycle_id', motorcycleId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as MotorcycleValuation | null;
    },
    enabled: !!motorcycleId,
  });
}

export function useCalculateValuation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      motorcycleId,
      mileage,
      conditionRating = 7,
      accidentHistory = false,
      serviceRecordsCount = 0,
      modifications = [],
    }: {
      motorcycleId: string;
      mileage?: number;
      conditionRating?: number;
      accidentHistory?: boolean;
      serviceRecordsCount?: number;
      modifications?: string[];
    }) => {
      const { data, error } = await supabase.rpc('calculate_motorcycle_valuation', {
        p_motorcycle_id: motorcycleId,
        p_mileage: mileage,
        p_condition_rating: conditionRating,
        p_accident_history: accidentHistory,
        p_service_records_count: serviceRecordsCount,
        p_modifications: modifications,
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['motorcycle-valuation', variables.motorcycleId] });
      toast({
        title: 'Valuation Complete',
        description: `Recommended price: $${data.toLocaleString()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: 'Failed to calculate valuation. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Omit<MarketplaceListing, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'motorcycles'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          ...listing,
          seller_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      toast({
        title: 'Success',
        description: 'Your motorcycle has been listed for sale!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
