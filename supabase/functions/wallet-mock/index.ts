import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    ...init,
  });
}

function notFound(msg = 'Not found') {
  return json({ error: msg }, { status: 404 });
}

function parsePath(url: string) {
  try {
    const u = new URL(url);
    // Path after /functions/v1/wallet-mock
    const parts = u.pathname.split('/');
    const idx = parts.findIndex((p) => p === 'wallet-mock');
    const sub = parts.slice(idx + 1).join('/') || '';
    return '/' + sub.replace(/^\/+/, '');
  } catch {
    return '/';
  }
}

// Simple SSE stream emitting a heartbeat and a sample balance update
function sseStream() {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let isClosed = false;
      
      const send = (event: string, data: any) => {
        if (!isClosed) {
          try {
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: event, ...data })}\n\n`));
          } catch (e) {
            isClosed = true;
          }
        }
      };
      
      const cleanup = () => {
        isClosed = true;
        clearInterval(hb);
        clearTimeout(t);
        clearTimeout(close);
      };
      
      // Heartbeat
      const hb = setInterval(() => send('heartbeat', { t: Date.now() }), 15000);
      // One-time sample balance update
      const t = setTimeout(() => send('balance_update', { asset: 'QCT', amount: 100 }), 2000);
      // Close after 60s
      const close = setTimeout(() => {
        cleanup();
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      }, 60000);
      
      // @ts-ignore - Deno runtime
      controller.signal?.addEventListener?.('abort', cleanup);
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...corsHeaders,
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const path = parsePath(req.url);

  try {
    if (path === '/sse') {
      return sseStream();
    }

    if (path === '/wallet/init' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const policy = body?.policy ?? 'delegated';
      return json({ address: 'knyt1q2w3e4r5t6y7u8i9o0', policy });
    }

    if (path === '/wallet/balances' && req.method === 'GET') {
      return json([
        { asset: 'QCT', amount: 100, symbol: 'QCT' },
        { asset: 'QOYN', amount: 42, symbol: 'QOYN' },
      ]);
    }

    if (path === '/wallet/fio-challenge' && req.method === 'POST') {
      const { handle } = await req.json();
      if (!handle) return json({ error: 'handle required' }, { status: 400 });
      return json({ challenge: `challenge_for_${handle}` });
    }

    if (path === '/wallet/link-fio' && req.method === 'POST') {
      const { handle, signature } = await req.json();
      if (!handle || !signature) return json({ error: 'handle and signature required' }, { status: 400 });
      return json({ success: true, handle });
    }

    if (path === '/x402/quote' && req.method === 'POST') {
      const { to, amount, asset } = await req.json();
      if (!to || !amount || !asset) return json({ error: 'to, amount, asset required' }, { status: 400 });
      return json({ txId: crypto.randomUUID(), amount, asset, to, from: 'knyt_sender', expires: new Date(Date.now() + 5 * 60_000).toISOString() });
    }

    if (path === '/x402/sign' && req.method === 'POST') {
      const { txId, signature } = await req.json();
      if (!txId || !signature) return json({ error: 'txId and signature required' }, { status: 400 });
      return json({ success: true });
    }

    if (path === '/x402/send' && req.method === 'POST') {
      const { txId } = await req.json();
      if (!txId) return json({ error: 'txId required' }, { status: 400 });
      return json({ success: true, txId });
    }

    if (path.startsWith('/x402/status/') && req.method === 'GET') {
      const txId = path.split('/').pop()!;
      return json({ txId, status: 'settled', amount: 10, asset: 'QCT', timestamp: new Date().toISOString() });
    }

    if (path === '/entitlements' && req.method === 'GET') {
      return json([]);
    }

    return notFound(`Path ${path} not found`);
  } catch (e) {
    console.error('wallet-mock error:', e);
    return json({ error: (e as Error).message }, { status: 500 });
  }
});
