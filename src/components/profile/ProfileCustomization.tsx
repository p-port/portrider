
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Camera,
  Save,
  Award,
  Star,
  Shield,
  Zap,
  Settings,
  Bell,
  ArrowLeft,
  Globe
} from 'lucide-react';

export function ProfileCustomization() {
  const { user, profile, refreshProfile } = useAuth();
  const { preferences, updatePreferences, loading: preferencesLoading } = useUserPreferences();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  });

  // Mock badges data - in a real app, this would come from the database
  const availableBadges = [
    { id: 'early_adopter', name: t('profile.badges.earlyAdopter'), icon: Star, color: 'bg-yellow-500' },
    { id: 'verified', name: t('profile.badges.verified'), icon: Shield, color: 'bg-blue-500' },
    { id: 'active_member', name: t('profile.badges.activeMember'), icon: Zap, color: 'bg-green-500' },
    { id: 'contributor', name: t('profile.badges.contributor'), icon: Award, color: 'bg-purple-500' },
  ];

  const userBadges = ['early_adopter', 'verified']; // Mock user badges

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('toast.invalidFile'),
        description: t('toast.invalidFile.desc'),
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: t('toast.fileTooLarge'),
        description: t('toast.fileTooLarge.desc'),
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update the form data with the new image URL
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: t('toast.imageUploaded'),
        description: t('toast.imageUploaded.desc'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('toast.uploadFailed'),
        description: t('toast.uploadFailed.desc'),
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile data
      await refreshProfile();

      toast({
        title: t('toast.profileUpdated'),
        description: t('toast.profileUpdated.desc'),
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: t('toast.updateFailed'),
        description: t('toast.updateFailed.desc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  if (preferencesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('profile.back')}
        </Button>
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('profile.picture.title')}</CardTitle>
            <CardDescription>{t('profile.picture.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={formData.avatar_url || undefined} 
                  alt="Profile picture"
                />
                <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploadingImage}>
                    <span>
                      <Camera className="h-4 w-4 mr-2" />
                      {uploadingImage ? t('profile.picture.uploading') : t('profile.picture.change')}
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {t('profile.picture.maxSize')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('profile.memberSince')} {new Date(profile?.created_at || '').toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile?.role || 'Rider'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.info.title')}</CardTitle>
            <CardDescription>{t('profile.info.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('profile.username')}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder={t('profile.username.placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('profile.firstName')}</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder={t('profile.firstName.placeholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">{t('profile.lastName')}</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder={t('profile.lastName.placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('profile.bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder={t('profile.bio.placeholder')}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 {t('profile.bio.characters')}
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? t('profile.saving') : t('profile.save')}
            </Button>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              {t('profile.preferences.title')}
            </CardTitle>
            <CardDescription>{t('profile.preferences.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t('profile.theme')}</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: 'light' | 'dark') => 
                      updatePreferences({ theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('profile.theme.light')}</SelectItem>
                      <SelectItem value="dark">{t('profile.theme.dark')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('profile.language')}
                  </Label>
                  <Select
                    value={language}
                    onValueChange={(value: 'en' | 'ko') => setLanguage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('profile.language.english')}</SelectItem>
                      <SelectItem value="ko">{t('profile.language.korean')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {t('profile.notifications.push')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.notifications.push.subtitle')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        notifications: { ...preferences.notifications, push: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('profile.notifications.email')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.notifications.email.subtitle')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        notifications: { ...preferences.notifications, email: checked }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('profile.badges.title')}</CardTitle>
            <CardDescription>{t('profile.badges.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableBadges.map((badge) => {
                const hasEarned = userBadges.includes(badge.id);
                const IconComponent = badge.icon;
                
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      hasEarned
                        ? 'border-primary bg-primary/10'
                        : 'border-muted bg-muted/20 opacity-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`p-3 rounded-full ${
                          hasEarned ? badge.color : 'bg-muted'
                        }`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant={hasEarned ? 'default' : 'secondary'} className="text-xs">
                        {badge.name}
                      </Badge>
                      {hasEarned && (
                        <p className="text-xs text-center text-muted-foreground">
                          {t('profile.badges.earned')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
