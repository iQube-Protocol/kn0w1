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
    0: `Guide users through the welcome/onboarding step. Help them understand the overall setup process and what they'll accomplish.`,

    1: `Help users configure their Mythos and Logos branches by naming them:
- Mythos: The narrative, storytelling identity
- Logos: The practical, real-world expertise
- These names will be used throughout the site`,

    2: `Help users define their Mythos (storytelling/narrative branch):
- Origin story and character identity
- Core values and tone of voice
- Target audience
- Safety guidelines for appropriate content`,

    3: `Help users define their Logos (practical expertise branch):
- Domain of expertise and outcomes
- Target outcomes people should achieve
- Calls-to-action
- Constraints and compliance considerations`,

    4: `Assist with defining Mission Pillars - the two main strategic focus areas:
- Each pillar needs a name and summary
- These drive the site's content and interactions
- Help them create clear, actionable pillars`,

    5: `Now that the pillars and branches are defined, help users create a site identity that reflects those values:
- Site name should align with their mission
- Slug should be URL-friendly (lowercase, hyphens)
- Description should capture the essence of what they've defined
- Identity should feel cohesive with their pillars and branches`,

    6: `Help configure goals and KPIs for each pillar:
- Goals should be specific and measurable (SMART framework)
- KPIs track progress toward goals
- Should align with the mission pillars defined earlier`,

    7: `Help configure utility settings - which features to enable:
- Content Creation: Content management and publishing
- Teaching (L2E): Learning-to-earn features
- Commercial: E-commerce and monetization
- Social: Social media integrations`,

    8: `Guide through review and finalization:
- Review all entered information for consistency
- Make final adjustments
- Confirm before creating the site`,
  };

  return guidance[step] || `Help users with the ${stepName} step of site setup.`;
}
