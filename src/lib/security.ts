
import { z } from 'zod';

// Password strength validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

// Content validation
export const validateContent = (content: string): boolean => {
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Rate limiting helper (for client-side display only)
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return {
    isRateLimited: (identifier: string): boolean => {
      const now = Date.now();
      const attempt = attempts.get(identifier);

      if (!attempt || now > attempt.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return false;
      }

      if (attempt.count >= maxAttempts) {
        return true;
      }

      attempt.count++;
      return false;
    },
    getRemainingTime: (identifier: string): number => {
      const attempt = attempts.get(identifier);
      if (!attempt) return 0;
      return Math.max(0, attempt.resetTime - Date.now());
    },
  };
};

// Security headers for enhanced protection
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Content Security Policy
export const contentSecurityPolicy = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self'",
  'connect-src': "'self' https://bmopoxksyvamiewogvrj.supabase.co",
  'frame-ancestors': "'none'",
};

// Security audit logging
export const logSecurityEvent = (event: {
  type: 'auth_attempt' | 'data_access' | 'suspicious_activity' | 'validation_failure';
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}) => {
  console.log(`[SECURITY ${event.severity.toUpperCase()}] ${event.type}:`, {
    timestamp: new Date().toISOString(),
    userId: event.userId || 'anonymous',
    details: event.details,
  });

  // In a production environment, you would send this to a proper logging service
  // such as Supabase Edge Functions or an external security monitoring service
};
