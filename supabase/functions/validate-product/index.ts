
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  title: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
}

function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

function validateProductData(data: ProductData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!data.title || sanitizeText(data.title).length < 2) {
    errors.push('Product title must be at least 2 characters long');
  }

  if (!data.category || sanitizeText(data.category).length < 1) {
    errors.push('Category is required');
  }

  // Validate price
  if (typeof data.price !== 'number' || data.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (data.price > 999999.99) {
    errors.push('Price is too high');
  }

  // Validate stock quantity
  if (typeof data.stock_quantity !== 'number' || data.stock_quantity < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  if (!Number.isInteger(data.stock_quantity)) {
    errors.push('Stock quantity must be a whole number');
  }

  // Validate description length
  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return { valid: errors.length === 0, errors };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();
    
    // Validate product data
    const validation = validateProductData(data);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, errors: validation.errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize data
    const sanitizedData = {
      ...data,
      title: sanitizeText(data.title),
      description: data.description ? sanitizeText(data.description) : undefined,
      category: sanitizeText(data.category),
    };

    return new Response(
      JSON.stringify({ success: true, data: sanitizedData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ success: false, errors: ['Validation failed'] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
