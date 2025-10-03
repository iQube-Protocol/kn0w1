import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, firstName, lastName } = await req.json();

    console.log('[search-users] Searching for:', { email, firstName, lastName });

    const matches = [];
    let page = 1;
    const perPage = 1000;
    
    // Search by email (exact match)
    if (email) {
      console.log('[search-users] Email search mode');
      
      while (true) {
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page, perPage });
        
        if (userError) {
          console.error('[search-users] Auth users error:', userError);
          throw userError;
        }
        
        console.log(`[search-users] Page ${page}: ${users.length} users`);
        
        const foundUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (foundUser) {
          console.log('[search-users] Email match found:', foundUser.email);
          matches.push(foundUser);
          break;
        }
        
        if (users.length < perPage) {
          console.log('[search-users] Email search exhausted, no match');
          break;
        }
        
        page++;
      }
    }
    // Search by name (tokenized partial match, up to 5 results)
    else if (firstName || lastName) {
      const searchTokens = `${firstName} ${lastName}`.toLowerCase().trim().split(/\s+/);
      console.log('[search-users] Name search mode, tokens:', searchTokens);
      
      while (matches.length < 5) {
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page, perPage });
        
        if (userError) {
          console.error('[search-users] Auth users error:', userError);
          throw userError;
        }
        
        console.log(`[search-users] Page ${page}: ${users.length} users`);
        
        for (const u of users) {
          if (matches.length >= 5) break;
          
          const metaFirstName = (u.user_metadata?.first_name || '').toLowerCase();
          const metaLastName = (u.user_metadata?.last_name || '').toLowerCase();
          const userEmail = (u.email || '').toLowerCase();
          
          const matchesTokens = searchTokens.every(token =>
            metaFirstName.includes(token) ||
            metaLastName.includes(token) ||
            userEmail.includes(token)
          );
          
          if (matchesTokens) {
            matches.push(u);
          }
        }
        
        if (users.length < perPage) {
          console.log('[search-users] Metadata search complete');
          break;
        }
        
        page++;
      }
      
      // Fallback to profiles table if needed
      if (matches.length < 5) {
        const searchTerm = searchTokens.join(' ');
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
          .limit(5 - matches.length);

        console.log('[search-users] Profiles search found:', profiles?.length || 0);

        if (profiles && profiles.length > 0) {
          page = 1;
          while (matches.length < 5) {
            const { data: { users } } = await supabase.auth.admin.listUsers({ page, perPage });
            
            for (const profile of profiles) {
              if (matches.length >= 5) break;
              const foundUser = users.find(u => u.id === profile.user_id);
              if (foundUser && !matches.some(m => m.id === foundUser.id)) {
                matches.push(foundUser);
              }
            }
            
            if (users.length < perPage || matches.length >= 5) break;
            page++;
          }
        }
      }
    }

    if (matches.length === 0) {
      console.log('[search-users] No matches found');
      return new Response(
        JSON.stringify({ found: false, matches: [] }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enrich matches with profile and roles data
    const enrichedMatches = await Promise.all(
      matches.map(async (user) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          profile: profile || null,
          roles: userRoles || []
        };
      })
    );

    console.log('[search-users] Returning', enrichedMatches.length, 'match(es)');

    return new Response(
      JSON.stringify({ found: true, matches: enrichedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );


  } catch (error) {
    console.error('[search-users] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});