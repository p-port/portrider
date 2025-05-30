
import { useCallback } from 'react';
import { sanitizeInput, validateContent, logSecurityEvent } from '@/lib/security';

export const useInputSanitization = () => {
  const sanitizeAndValidate = useCallback((input: string): string => {
    if (!validateContent(input)) {
      logSecurityEvent({
        type: 'validation_failure',
        details: `Potentially dangerous content detected: ${input.substring(0, 100)}...`,
        severity: 'high',
      });
      // Return sanitized version instead of throwing error for better UX
      return sanitizeInput(input);
    }
    return sanitizeInput(input);
  }, []);

  const sanitizeFormData = useCallback((data: Record<string, any>): Record<string, any> => {
    const sanitizedData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeAndValidate(value);
      } else if (Array.isArray(value)) {
        sanitizedData[key] = value.map(item => 
          typeof item === 'string' ? sanitizeAndValidate(item) : item
        );
      } else {
        sanitizedData[key] = value;
      }
    }
    
    return sanitizedData;
  }, [sanitizeAndValidate]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }, []);

  const validateURL = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return !url.toLowerCase().includes('javascript:') && !url.toLowerCase().includes('data:');
    } catch {
      return false;
    }
  }, []);

  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }, []);

  return {
    sanitizeInput: sanitizeAndValidate,
    sanitizeFormData,
    validateEmail,
    validateURL,
    validatePhoneNumber,
    validateContent,
  };
};
