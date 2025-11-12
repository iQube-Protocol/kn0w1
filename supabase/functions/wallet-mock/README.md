# Mock Wallet Server

This is a mock implementation of the AgentiQ Wallet Service API for testing x402 payment flows.

## Deployed Version (Recommended)

The mock server is already deployed as a Supabase Edge Function at:
```
https://ysykvckvggaqykhhntyo.supabase.co/functions/v1/wallet-mock
```

**No local setup needed!** The app automatically uses this deployed version when `VITE_AGENTIQ_WALLET_BASE_URL` is not set.

## Local Testing (Optional)

If you want to run the mock server locally for development:

### Prerequisites
- Deno installed ([deno.land](https://deno.land))

### Run Locally

```bash
cd supabase/functions/wallet-mock
deno run --allow-net --allow-env index.ts
```

Or using Supabase CLI:
```bash
supabase functions serve wallet-mock --no-verify-jwt
```

Then set in your `.env`:
```
VITE_AGENTIQ_WALLET_BASE_URL=http://localhost:8080
```

## Mock API Endpoints

### Wallet Management
- `POST /wallet/init` - Initialize wallet (returns address: knyt1q2w3e4r5t6y7u8i9o0)
- `GET /wallet/balances` - Get balances (returns 100 QCT, 42 QOYN)
- `POST /wallet/fio-challenge` - Request FIO handle challenge
- `POST /wallet/link-fio` - Link FIO handle
- `GET /sse` - Server-sent events for real-time balance updates

### x402 Payment Flow
- `POST /x402/quote` - Create payment quote
- `POST /x402/sign` - Sign transaction
- `POST /x402/send` - Send payment
- `GET /x402/status/:txId` - Check transaction status (always returns "settled")

### Entitlements
- `GET /entitlements` - Get user entitlements (returns empty array)

## Testing Payment Flow

1. **Wallet Initialization** - Automatic on login
2. **FIO Handle Linking** - Use format `name@knyt` or `name@qripto`
3. **Browse Content** - Find paid assets (prices: 10-100 QCT)
4. **Purchase** - Click "Purchase" → "Pay with Wallet"
5. **Settlement** - Mock server returns "settled" immediately
6. **Verification** - Check database for new entitlement

## Mock Behavior

- All transactions settle immediately
- No actual blockchain interaction
- No real balance deduction
- FIO handles accepted without verification
- All signatures accepted

## Production Migration

To use the real AgentiQ Wallet Service:

```bash
# .env
VITE_AGENTIQ_WALLET_BASE_URL=https://wallet.agentiq.ai
```

The application code requires no changes - it's a drop-in replacement.
