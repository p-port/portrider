
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobCreationRequest {
  motorcycle_id: string;
  user_id: string;
  vin?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for portrider
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { motorcycle_id, user_id, vin } = await req.json() as JobCreationRequest;

    console.log('Creating external job for motorcycle:', { motorcycle_id, user_id, vin });

    // Check if PROJECTPORTMS_API_KEY is available
    const apiKey = Deno.env.get('PROJECTPORTMS_API_KEY');
    console.log('API Key status:', apiKey ? 'Available' : 'Missing');

    // Prepare job data for projectportms
    const jobData = {
      job_type: 'Ownership Transfer',
      status: 'closed',
      created_by: user_id,
      vehicle_id: vin || motorcycle_id,
      auto_generated: true,
      note: 'System generated from portrider - My Garage'
    };

    console.log('Job data to send:', jobData);

    // Send job to projectportms via their API endpoint
    const projectportmsUrl = 'https://pkmyuwlgvozgclrypdqv.supabase.co/functions/v1/receive-system-job';
    
    console.log('Attempting to call:', projectportmsUrl);

    const response = await fetch(projectportmsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || 'no-key-provided'}`,
      },
      body: JSON.stringify(jobData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`Failed to create job in projectportms: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Successfully created external job:', result);

    // Update the external job tracking in portrider (if you have this table)
    try {
      const { error: trackingError } = await supabase
        .from('external_job_tracking')
        .update({
          external_job_id: result.job_id || result.id,
          status: 'completed',
          external_response: result,
          completed_at: new Date().toISOString()
        })
        .eq('motorcycle_id', motorcycle_id);

      if (trackingError) {
        console.error('Error updating job tracking (non-critical):', trackingError);
      }
    } catch (trackingUpdateError) {
      console.log('Job tracking update failed (table might not exist):', trackingUpdateError);
    }

    return new Response(
      JSON.stringify({ success: true, external_job_id: result.job_id || result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-external-job function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create external job', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
