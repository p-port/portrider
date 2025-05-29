
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { forwardRef, useCallback } from 'react';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onChange, onValueChange, ...props }, ref) => {
    const { sanitizeInput } = useInputSanitization();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      
      // Update the event value with sanitized data
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitizedValue,
        },
      };

      onChange?.(sanitizedEvent);
      onValueChange?.(sanitizedValue);
    }, [onChange, onValueChange, sanitizeInput]);

    return (
      <Input
        {...props}
        ref={ref}
        onChange={handleChange}
        autoComplete="off"
        spellCheck="false"
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';

export const SecureTextarea = forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ onChange, onValueChange, ...props }, ref) => {
    const { sanitizeInput } = useInputSanitization();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      
      // Update the event value with sanitized data
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitizedValue,
        },
      };

      onChange?.(sanitizedEvent);
      onValueChange?.(sanitizedValue);
    }, [onChange, onValueChange, sanitizeInput]);

    return (
      <Textarea
        {...props}
        ref={ref}
        onChange={handleChange}
        autoComplete="off"
        spellCheck="false"
      />
    );
  }
);

SecureTextarea.displayName = 'SecureTextarea';
