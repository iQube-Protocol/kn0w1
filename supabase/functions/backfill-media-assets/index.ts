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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all content items without media assets
    const { data: contentItems, error: fetchError } = await supabase
      .from('content_items')
      .select(`
        id,
        title,
        type,
        social_url,
        social_embed_html,
        category_id,
        content_categories(slug)
      `)
      .is('cover_image_id', null);

    if (fetchError) throw fetchError;

    let created = 0;
    let generatedImages = 0;
    const results = [];

    for (const item of contentItems || []) {
      // Check if item already has media assets
      const { data: existing } = await supabase
        .from('media_assets')
        .select('id')
        .eq('content_item_id', item.id)
        .limit(1);

      if (existing && existing.length > 0) continue;

      let externalUrl = '';
      let kind = 'image';
      let shouldGenerate = false;

      // Priority 1: Extract from social_url
      if (item.social_url) {
        if (item.social_url.includes('youtube.com') || item.social_url.includes('youtu.be')) {
          kind = 'video';
          externalUrl = item.social_url;
        } else if (item.social_url.includes('vimeo.com')) {
          kind = 'video';
          externalUrl = item.social_url;
        } else {
          externalUrl = item.social_url;
        }
      }
      // Priority 2: Extract from social_embed_html
      else if (item.social_embed_html) {
        const imgMatch = item.social_embed_html.match(/src=["']([^"']+)["']/);
        if (imgMatch) {
          externalUrl = imgMatch[1];
          // If it's a local asset path, use category default instead
          if (externalUrl.startsWith('/src/assets/')) {
            shouldGenerate = true;
          }
        } else {
          shouldGenerate = true;
        }
      }
      // Priority 3: Generate for social posts
      else if (item.type === 'social') {
        shouldGenerate = true;
      }

      // Generate AI image for social posts without media
      if (shouldGenerate) {
        try {
          const prompt = `A professional social media post graphic about "${item.title}". Modern, clean design with engaging visuals. 16:9 aspect ratio.`;
          
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [{
                role: 'user',
                content: prompt
              }],
              modalities: ['image', 'text']
            })
          });

          const aiData = await aiResponse.json();
          const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (imageBase64) {
            // Upload to Supabase Storage
            const fileName = `generated/${item.id}.png`;
            const base64Data = imageBase64.split(',')[1];
            const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('content-files')
              .upload(fileName, bytes, {
                contentType: 'image/png',
                upsert: true
              });

            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('content-files')
                .getPublicUrl(fileName);
              
              externalUrl = publicUrl;
              generatedImages++;
            }
          }
        } catch (genError) {
          console.error('Failed to generate image:', genError);
          // Fall through to category default
        }
      }

      // Priority 4: Category-based defaults
      if (!externalUrl) {
        const categorySlug = item.content_categories?.slug || '';
        const defaultImages: Record<string, string> = {
          'epic-stories': 'https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/defaults/content-1.jpg',
          'masterclass': 'https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/defaults/content-2.jpg',
          'documentary': 'https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/defaults/content-3.jpg',
          'impact-projects': 'https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/defaults/content-3.jpg',
        };
        externalUrl = defaultImages[categorySlug] || 'https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/defaults/hero-image.jpg';
      }

      // Create media asset
      const { error: insertError } = await supabase
        .from('media_assets')
        .insert({
          content_item_id: item.id,
          kind,
          external_url: externalUrl,
          display_order: 0
        });

      if (insertError) {
        console.error('Failed to insert media asset:', insertError);
        results.push({ id: item.id, title: item.title, status: 'failed', error: insertError.message });
      } else {
        created++;
        results.push({ id: item.id, title: item.title, status: 'success', url: externalUrl });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created,
        generatedImages,
        total: contentItems?.length || 0,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in backfill-media-assets:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
