
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    push: boolean;
    email: boolean;
  };
}

interface DashboardLayout {
  cards: string[];
  visible: Record<string, boolean>;
}

export function useUserPreferences() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: { push: true, email: true }
  });
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>({
    cards: ["my_garage", "forums", "news", "groups", "marketplace", "twisties", "tickets"],
    visible: {
      news: true,
      forums: true,
      groups: true,
      tickets: true,
      twisties: true,
      my_garage: true,
      marketplace: true
    }
  });
  const [loading, setLoading] = useState(true);

  // Load preferences from profile
  useEffect(() => {
    if (profile) {
      if (profile.preferences) {
        setPreferences(profile.preferences as UserPreferences);
      }
      if (profile.dashboard_layout) {
        setDashboardLayout(profile.dashboard_layout as DashboardLayout);
      }
      setLoading(false);
    }
  }, [profile]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateDashboardLayout = async (newLayout: Partial<DashboardLayout>) => {
    if (!user) return;

    const updatedLayout = { ...dashboardLayout, ...newLayout };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_layout: updatedLayout })
        .eq('id', user.id);

      if (error) throw error;

      setDashboardLayout(updatedLayout);
      toast({
        title: "Dashboard updated",
        description: "Your dashboard layout has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dashboard layout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveSetting = async (key: string, value: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value
        });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSetting = async (key: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', user.id)
        .eq('setting_key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value || null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  };

  return {
    preferences,
    dashboardLayout,
    loading,
    updatePreferences,
    updateDashboardLayout,
    saveSetting,
    getSetting
  };
}
