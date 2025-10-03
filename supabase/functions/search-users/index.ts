import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

    // Query auth.users using service role
    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        total_points,
        level,
        civic_status,
        created_at
      `);

    // Apply filters
    if (firstName) {
      query = query.ilike('first_name', `%${firstName}%`);
    }
    if (lastName) {
      query = query.ilike('last_name', `%${lastName}%`);
    }

    const { data: profiles, error: profileError } = await query;

    if (profileError) {
      console.error('[search-users] Profile query error:', profileError);
      throw profileError;
    }

    console.log('[search-users] Found profiles:', profiles?.length);

    // If email is provided, we need to check auth.users
    if (email) {
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('[search-users] Auth users error:', userError);
        throw userError;
      }

      // Find user by email
      const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!authUser) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get profile and roles for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      const result = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        profile: profile || null,
        roles: userRoles || []
      };

      console.log('[search-users] Found user by email:', result.email);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search by name - return first matching profile with auth data
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      
      // Get auth user data
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('[search-users] Auth users error:', userError);
        throw userError;
      }

      const authUser = users.find(u => u.id === profile.user_id);
      
      if (!authUser) {
        return new Response(
          JSON.stringify({ error: 'User not found in auth' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id);

      const result = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        profile: profile,
        roles: userRoles || []
      };

      console.log('[search-users] Found user by name:', result.email);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[search-users] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});