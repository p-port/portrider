
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ko';
  setLanguage: (lang: 'en' | 'ko') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Profile Settings
    'profile.title': 'Profile Settings',
    'profile.subtitle': 'Customize your profile information and preferences',
    'profile.back': 'Back',
    'profile.picture.title': 'Profile Picture',
    'profile.picture.subtitle': 'Upload and manage your profile picture',
    'profile.picture.change': 'Change Picture',
    'profile.picture.uploading': 'Uploading...',
    'profile.picture.maxSize': 'Max file size: 5MB',
    'profile.info.title': 'Profile Information',
    'profile.info.subtitle': 'Update your personal information and bio',
    'profile.username': 'Username',
    'profile.username.placeholder': 'Enter username',
    'profile.firstName': 'First Name',
    'profile.firstName.placeholder': 'Enter first name',
    'profile.lastName': 'Last Name',
    'profile.lastName.placeholder': 'Enter last name',
    'profile.bio': 'Bio',
    'profile.bio.placeholder': 'Tell us about yourself and your riding experience...',
    'profile.bio.characters': 'characters',
    'profile.save': 'Save Profile',
    'profile.saving': 'Saving...',
    'profile.memberSince': 'Member since',
    'profile.preferences.title': 'Preferences',
    'profile.preferences.subtitle': 'Manage your app preferences and notification settings',
    'profile.theme': 'Theme',
    'profile.theme.light': 'Light',
    'profile.theme.dark': 'Dark',
    'profile.language': 'Language',
    'profile.language.english': 'English',
    'profile.language.korean': '한국어',
    'profile.notifications.push': 'Push Notifications',
    'profile.notifications.push.subtitle': 'Receive push notifications for important updates',
    'profile.notifications.email': 'Email Notifications',
    'profile.notifications.email.subtitle': 'Receive email notifications for updates',
    'profile.badges.title': 'Your Badges',
    'profile.badges.subtitle': 'Achievements and recognition you\'ve earned',
    'profile.badges.earned': 'Earned',
    'profile.badges.earlyAdopter': 'Early Adopter',
    'profile.badges.verified': 'Verified Rider',
    'profile.badges.activeMember': 'Active Member',
    'profile.badges.contributor': 'Top Contributor',
    // Toast messages
    'toast.invalidFile': 'Invalid file type',
    'toast.invalidFile.desc': 'Please select an image file.',
    'toast.fileTooLarge': 'File too large',
    'toast.fileTooLarge.desc': 'Please select an image smaller than 5MB.',
    'toast.imageUploaded': 'Image uploaded',
    'toast.imageUploaded.desc': 'Profile picture uploaded successfully.',
    'toast.uploadFailed': 'Upload failed',
    'toast.uploadFailed.desc': 'Failed to upload profile picture. Please try again.',
    'toast.profileUpdated': 'Profile updated',
    'toast.profileUpdated.desc': 'Your profile has been updated successfully.',
    'toast.updateFailed': 'Update failed',
    'toast.updateFailed.desc': 'Failed to update profile. Please try again.',
  },
  ko: {
    // Profile Settings
    'profile.title': '프로필 설정',
    'profile.subtitle': '프로필 정보와 환경설정을 사용자 정의하세요',
    'profile.back': '뒤로',
    'profile.picture.title': '프로필 사진',
    'profile.picture.subtitle': '프로필 사진을 업로드하고 관리하세요',
    'profile.picture.change': '사진 변경',
    'profile.picture.uploading': '업로드 중...',
    'profile.picture.maxSize': '최대 파일 크기: 5MB',
    'profile.info.title': '프로필 정보',
    'profile.info.subtitle': '개인 정보와 자기소개를 업데이트하세요',
    'profile.username': '사용자명',
    'profile.username.placeholder': '사용자명을 입력하세요',
    'profile.firstName': '이름',
    'profile.firstName.placeholder': '이름을 입력하세요',
    'profile.lastName': '성',
    'profile.lastName.placeholder': '성을 입력하세요',
    'profile.bio': '자기소개',
    'profile.bio.placeholder': '자신과 라이딩 경험에 대해 알려주세요...',
    'profile.bio.characters': '글자',
    'profile.save': '프로필 저장',
    'profile.saving': '저장 중...',
    'profile.memberSince': '가입일',
    'profile.preferences.title': '환경설정',
    'profile.preferences.subtitle': '앱 환경설정과 알림 설정을 관리하세요',
    'profile.theme': '테마',
    'profile.theme.light': '라이트',
    'profile.theme.dark': '다크',
    'profile.language': '언어',
    'profile.language.english': 'English',
    'profile.language.korean': '한국어',
    'profile.notifications.push': '푸시 알림',
    'profile.notifications.push.subtitle': '중요한 업데이트에 대한 푸시 알림을 받습니다',
    'profile.notifications.email': '이메일 알림',
    'profile.notifications.email.subtitle': '업데이트에 대한 이메일 알림을 받습니다',
    'profile.badges.title': '내 배지',
    'profile.badges.subtitle': '획득한 성취와 인정',
    'profile.badges.earned': '획득',
    'profile.badges.earlyAdopter': '얼리 어답터',
    'profile.badges.verified': '인증된 라이더',
    'profile.badges.activeMember': '활성 멤버',
    'profile.badges.contributor': '톱 기여자',
    // Toast messages
    'toast.invalidFile': '잘못된 파일 형식',
    'toast.invalidFile.desc': '이미지 파일을 선택해주세요.',
    'toast.fileTooLarge': '파일이 너무 큽니다',
    'toast.fileTooLarge.desc': '5MB보다 작은 이미지를 선택해주세요.',
    'toast.imageUploaded': '이미지 업로드됨',
    'toast.imageUploaded.desc': '프로필 사진이 성공적으로 업로드되었습니다.',
    'toast.uploadFailed': '업로드 실패',
    'toast.uploadFailed.desc': '프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.',
    'toast.profileUpdated': '프로필 업데이트됨',
    'toast.profileUpdated.desc': '프로필이 성공적으로 업데이트되었습니다.',
    'toast.updateFailed': '업데이트 실패',
    'toast.updateFailed.desc': '프로필 업데이트에 실패했습니다. 다시 시도해주세요.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ko'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ko';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: 'en' | 'ko') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
