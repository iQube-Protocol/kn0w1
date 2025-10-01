import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, agentSiteId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get agent site branding and context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: agentSite } = await supabase
      .from('agent_sites')
      .select('title, branding_json')
      .eq('id', agentSiteId)
      .single();

    let systemPrompt = `You are a content creation assistant for the MetaKnyt platform - a Web3-powered civic engagement and learn-to-earn ecosystem.

Brand Context:
- Site Name: ${agentSite?.title || 'Agent Site'}
- MetaKnyt Aesthetic: Futuristic, cyberpunk-inspired, neon colors (cyan, magenta, orange), bold typography
- Mission: Empower communities through civic readiness and Web3 education
- Tone: Empowering, educational, community-focused, future-forward

Generate content that:
1. Aligns with the MetaKnyt aesthetic and mission
2. Is engaging, informative, and actionable
3. Uses inclusive language and empowers users
4. Incorporates Web3, civic engagement, or community themes when relevant`;

    let userPrompt = '';
    
    if (type === 'title') {
      userPrompt = `Generate 5 compelling titles for content about: ${prompt}. Make them engaging, SEO-friendly, and aligned with MetaKnyt's mission. Return as JSON array: {"titles": ["title1", "title2", ...]}`;
    } else if (type === 'description') {
      userPrompt = `Generate a compelling 2-3 sentence description for content titled "${prompt}". Make it engaging and actionable. Return as JSON: {"description": "text"}`;
    } else if (type === 'content') {
      userPrompt = `Generate comprehensive content (500-800 words) about: ${prompt}. Include:
- Engaging introduction
- Key points with actionable insights
- Connection to civic engagement or Web3 concepts
- Empowering conclusion with call-to-action

Return as JSON: {"content": "markdown formatted text"}`;
    } else if (type === 'image_prompt') {
      userPrompt = `Generate a detailed image prompt for AI image generation about: ${prompt}. 
Style: Cyberpunk, futuristic, neon colors (cyan/magenta/orange), bold geometric shapes, digital art style
Include: Visual elements that represent civic engagement, community, or Web3 technology
Return as JSON: {"prompt": "detailed image generation prompt"}`;
    }

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(generatedText);
    } catch (e) {
      // If not valid JSON, return as plain text
      result = { text: generatedText };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});