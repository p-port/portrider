
import { z } from 'zod';

// Enhanced validation schemas with sanitization
export const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform(sanitizeString);

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone format')
  .transform(sanitizeString);

export const textSchema = z
  .string()
  .min(1, 'This field is required')
  .transform(sanitizeString);

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .transform(sanitizeString);

export const descriptionSchema = z
  .string()
  .max(1000, 'Description must be less than 1000 characters')
  .transform(sanitizeString)
  .optional();

export const priceSchema = z
  .number()
  .positive('Price must be greater than 0')
  .max(999999.99, 'Price is too high');

export const stockSchema = z
  .number()
  .int('Stock must be a whole number')
  .min(0, 'Stock cannot be negative');

// Business validation schema
export const businessSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  location: textSchema.optional(),
  category: textSchema,
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

// Product validation schema
export const productSchema = z.object({
  title: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  stock_quantity: stockSchema,
  category: textSchema,
});

// Motorcycle validation schema
export const motorcycleSchema = z.object({
  make: nameSchema,
  model: nameSchema,
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  nickname: z.string().max(50).transform(sanitizeString).optional(),
  vin: z.string().max(17).transform(sanitizeString).optional(),
});

// Support ticket validation schema
export const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100).transform(sanitizeString),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).transform(sanitizeString),
  category: z.enum(['technical', 'account', 'billing', 'feature_request', 'bug_report', 'other']),
});

// Forum post validation schema
export const forumPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200).transform(sanitizeString),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000).transform(sanitizeString),
});

// Comment validation schema
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000).transform(sanitizeString),
});
