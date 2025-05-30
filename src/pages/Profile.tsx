
import { ProfileCustomization } from '@/components/profile/ProfileCustomization';
import { LanguageProvider } from '@/hooks/useLanguage';

const Profile = () => {
  return (
    <LanguageProvider>
      <ProfileCustomization />
    </LanguageProvider>
  );
};

export default Profile;
