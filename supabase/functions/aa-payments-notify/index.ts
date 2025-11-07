import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-402-request-id, x-402-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { request_id, status, facilitator_ref } = await req.json();

    if (!request_id || !status) {
      return new Response(
        JSON.stringify({ error: 'request_id and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[x402 Settlement] Processing: ${request_id} - Status: ${status}`);

    // Verify request_id exists
    const { data: transaction, error: txError } = await supabaseClient
      .from('x402_transactions')
      .select('*')
      .eq('request_id', request_id)
      .single();

    if (txError || !transaction) {
      console.error('Transaction not found:', txError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Finalize settlement using RPC
    const { data: result, error: settleError } = await supabaseClient
      .rpc('rpc_finalize_settlement', {
        p_request_id: request_id,
        p_facilitator_ref: facilitator_ref,
        p_status: status
      });

    if (settleError) throw settleError;

    console.log(`[x402 Settlement] Completed: ${request_id}`, result);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...result 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing settlement:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});