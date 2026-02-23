import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, endpoint, modelId, size } = await req.json();
    
    console.log('Local image generation request:', { modelId, endpoint, prompt });

    if (!endpoint) {
      throw new Error('No endpoint configured for local model');
    }

    // Forward request to local server
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size: size || '1024x1024',
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      throw new Error(`Local server returned ${response.status}`);
    }

    const data = await response.json();

    console.log('Local image generated successfully');

    return new Response(
      JSON.stringify({ success: true, imageUrl: data.imageUrl || data.image }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in local-image-gen function:', error);
    
    // Return specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'TimeoutError') {
        errorMessage = 'Local server timeout. Is your model server running?';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Could not connect to local server. Check endpoint configuration.';
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});