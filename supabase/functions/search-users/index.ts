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

    // Get all auth users first (we need this for both email and name searches)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('[search-users] Auth users error:', userError);
      throw userError;
    }

    console.log('[search-users] Total users in auth:', users.length);

    let foundUser = null;

    // Search by email
    if (email) {
      foundUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      console.log('[search-users] Email search result:', foundUser ? 'found' : 'not found');
    } 
    // Search by name in user metadata and profiles
    else if (firstName || lastName) {
      const searchTerm = `${firstName} ${lastName}`.toLowerCase().trim();
      console.log('[search-users] Searching for name:', searchTerm);

      // First try to find in auth.users user_metadata
      foundUser = users.find(u => {
        const metaFirstName = (u.user_metadata?.first_name || '').toLowerCase();
        const metaLastName = (u.user_metadata?.last_name || '').toLowerCase();
        const fullName = `${metaFirstName} ${metaLastName}`.trim();
        const email = (u.email || '').toLowerCase();
        
        return fullName.includes(searchTerm) || 
               email.includes(searchTerm) ||
               metaFirstName.includes(searchTerm) ||
               metaLastName.includes(searchTerm);
      });

      console.log('[search-users] User metadata search result:', foundUser ? 'found' : 'not found');

      // If not found in metadata, search profiles table
      if (!foundUser) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);

        console.log('[search-users] Profiles search found:', profiles?.length || 0);

        if (profiles && profiles.length > 0) {
          foundUser = users.find(u => u.id === profiles[0].user_id);
        }
      }
    }

    if (!foundUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get profile and roles for the found user
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', foundUser.id)
      .maybeSingle();

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', foundUser.id);

    const result = {
      id: foundUser.id,
      email: foundUser.email,
      created_at: foundUser.created_at,
      email_confirmed_at: foundUser.email_confirmed_at,
      last_sign_in_at: foundUser.last_sign_in_at,
      profile: profile || null,
      roles: userRoles || []
    };

    console.log('[search-users] Found user:', result.email);

    return new Response(
      JSON.stringify(result),
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