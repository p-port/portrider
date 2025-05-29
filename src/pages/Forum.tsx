
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ForumCategoryList } from '@/components/forum/ForumCategoryList';
import { ForumHeader } from '@/components/forum/ForumHeader';

const Forum = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <ForumHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ForumCategoryList />
      </div>
    </div>
  );
};

export default Forum;
