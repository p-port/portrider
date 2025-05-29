
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CreateCategoryDialog } from './CreateCategoryDialog';

export function ForumHeader() {
  const { user, profile } = useAuth();
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
              <p className="text-gray-600">Connect with fellow riders and share your experiences</p>
            </div>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={() => setShowCreateCategory(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Category</span>
            </Button>
          )}
        </div>
      </div>
      
      {showCreateCategory && (
        <CreateCategoryDialog 
          open={showCreateCategory}
          onOpenChange={setShowCreateCategory}
        />
      )}
    </div>
  );
}
