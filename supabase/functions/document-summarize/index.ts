import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { documentUrl, action, fileName } = await req.json();
    
    console.log('Document summarization request:', { documentUrl, action, fileName });

    // Download document
    const docResponse = await fetch(documentUrl);
    if (!docResponse.ok) {
      throw new Error('Failed to download document');
    }

    const docText = await docResponse.text();
    
    // Prepare prompt based on action
    let prompt = '';
    let noteTitle = '';
    
    switch (action) {
      case 'summarize':
        prompt = `Summarize this document concisely:\n\n${docText.slice(0, 10000)}`;
        noteTitle = `Summary: ${fileName}`;
        break;
      case 'extract-key-points':
        prompt = `Extract the key points from this document as bullet points:\n\n${docText.slice(0, 10000)}`;
        noteTitle = `Key Points: ${fileName}`;
        break;
      default:
        prompt = `Analyze this document:\n\n${docText.slice(0, 10000)}`;
        noteTitle = `Analysis: ${fileName}`;
    }

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes and analyzes documents.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI request failed');
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices[0].message.content;

    // Save to notes table
    const { data: note, error: noteError } = await supabaseClient
      .from('notes')
      .insert({
        user_id: user.id,
        title: noteTitle,
        content: summary,
        note_type: 'document-summary',
      })
      .select()
      .single();

    if (noteError) throw noteError;

    console.log('Document summarized successfully:', note.id);

    return new Response(
      JSON.stringify({ success: true, noteId: note.id, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in document-summarize function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});