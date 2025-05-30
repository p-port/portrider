
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { useNavigate } from 'react-router-dom';

export function ForumHeader() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community Forum</h1>
                <p className="text-muted-foreground">Connect with fellow riders and share your experiences</p>
              </div>
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
