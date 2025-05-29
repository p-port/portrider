
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="relative overflow-hidden border-2 transition-all duration-300 hover:scale-105
        bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 
        dark:from-purple-900/30 dark:via-pink-900/20 dark:to-blue-900/30
        border-purple-200 dark:border-purple-700
        hover:from-purple-200 hover:via-pink-100 hover:to-blue-200
        dark:hover:from-purple-800/40 dark:hover:via-pink-800/30 dark:hover:to-blue-800/40"
    >
      <div className="relative z-10 flex items-center gap-2">
        {theme === 'light' ? (
          <>
            <Moon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-200">Dark</span>
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Light</span>
          </>
        )}
      </div>
      
      {/* Gradient overlay animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
        dark:via-white/10 translate-x-[-100%] group-hover:translate-x-[100%] 
        transition-transform duration-700 ease-in-out" />
    </Button>
  );
}
