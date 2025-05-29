
import { useCallback } from 'react';
import { sanitizeString } from '@/lib/validation';

export function useInputSanitization() {
  const sanitizeInput = useCallback((value: string) => {
    return sanitizeString(value);
  }, []);

  const sanitizeFormData = useCallback((data: Record<string, any>) => {
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizeString(sanitized[key]);
      }
    });
    
    return sanitized;
  }, []);

  return {
    sanitizeInput,
    sanitizeFormData,
  };
}
