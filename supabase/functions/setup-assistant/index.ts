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
    const { message, step, stepName, context, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context-aware system prompt based on the step
    const stepGuidance = getStepGuidance(step, stepName);
    const systemPrompt = `You are a helpful AI assistant guiding users through the setup of their agent site. 

Current Step: ${stepName} (Step ${step})
${stepGuidance}

Provide clear, concise, and actionable advice. Be encouraging and friendly. Keep responses under 200 words unless the user asks for more detail.

${context ? `Current Context: ${JSON.stringify(context, null, 2)}` : ''}`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Setup assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: "I'm having trouble connecting right now. Please try again in a moment."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getStepGuidance(step: number, stepName: string): string {
  const guidance: Record<number, string> = {
    0: `Help users define their site's identity including name, slug (URL-friendly identifier), description, and whether it's a master template or branch site. 
    
Key points:
- Site name should be clear and memorable
- Slug should be lowercase, hyphenated, no spaces (e.g., "my-awesome-site")
- Master sites are templates that can be cloned to branch sites
- Description helps explain the site's purpose`,

    1: `Guide users through the welcome/onboarding step. Help them understand the overall setup process and what they'll accomplish.`,

    2: `Help users configure their Mythos and Logos branches:
- Mythos: Emotional, narrative-driven content and values
- Logos: Rational, factual, analytical content and values
- Both need display names, summaries, and core values
- Tone and audience settings define communication style`,

    3: `Assist with defining Mission Pillars - the core strategic areas:
- Each pillar has goals, KPIs, and utilities
- Goals should be specific and measurable
- KPIs track progress
- Utilities define what features are available (content creation, teaching, etc.)`,

    4: `Help configure utility settings:
- Content Creation: Enable content management
- Teaching (L2E): Learning-to-earn features
- Commercial: E-commerce and monetization
- Social: Social media integrations
Each can be enabled/disabled and configured`,

    5: `Guide through review and finalization:
- Review all entered information
- Make final adjustments
- Confirm before creating the site`,
  };

  return guidance[step] || `Help users with the ${stepName} step of site setup.`;
}
