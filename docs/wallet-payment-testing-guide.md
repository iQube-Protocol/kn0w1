# Wallet Payment Flow Testing Guide

## Prerequisites

1. **Mock Server**: The mock server is already deployed as a Supabase Edge Function - no setup needed!
   
2. **Environment Variable**: Leave `VITE_AGENTIQ_WALLET_BASE_URL` empty in `.env` to use deployed mock
   - Optional: Set to `http://localhost:8080` for local testing
   - See `supabase/functions/wallet-mock/README.md` for local setup

3. **Logged In User**: Be authenticated with a valid Supabase session

## Test Flow Overview

```
1. Wallet Initialization → 2. FIO Handle Linking → 3. Asset Selection → 4. Payment → 5. Entitlement Verification
```

---

## Step 1: Wallet Initialization

### What Should Happen
- DID is created/retrieved from `did_identities` table
- DID JWT is generated via `wallet-did-jwt` edge function
- Wallet is initialized with mock server (`/wallet/init`)
- Initial balances are fetched
- SSE connection established for real-time updates

### How to Test
1. Refresh the page or log in
2. Open browser DevTools → Console
3. Look for logs:
   ```
   Using existing kn0w1 DID: did:kn0w1:...
   Wallet initialized: {address: "knyt1q2w3e4r5t6y7u8i9o0", policy: "delegated"}
   ```

### Expected State
- **DID**: `did:kn0w1:[user_id_without_dashes]`
- **Wallet Address**: `knyt1q2w3e4r5t6y7u8i9o0` (mock)
- **Initial Balances**: 100 QCT, 42 QOYN

### Common Issues
- ❌ **Error: "DID creation failed: duplicate key"**
  - Solution: My fix should handle this - it now fetches all DIDs and prefers kn0w1 format
- ❌ **Error: "Failed to bundle using Rollup"**
  - Solution: Already removed - shouldn't occur anymore
- ❌ **No wallet initialization**
  - Check: Is `VITE_AGENTIQ_WALLET_BASE_URL` set correctly?
  - Check: Is mock server running on port 8080?

---

## Step 2: FIO Handle Linking

### What Should Happen
- User enters FIO handle in format `name@domain` (e.g., `dele@knyt`)
- Mock server returns challenge
- Signature is generated and sent to `/wallet/link-fio`
- FIO handle is stored in `did_identities.agent_handle`

### How to Test
1. Click "Wallet" button in the UI (if implemented)
2. Or trigger wallet onboarding dialog
3. Enter FIO handle: `testuser@knyt` or `testuser@qripto`
4. Click "Link Handle"

### Expected State
- **Console Log**: `FIO handle linked successfully: testuser@knyt`
- **Database**: `did_identities.agent_handle = 'testuser@knyt'`
- **Wallet State**: `state.fioHandle = 'testuser@knyt'`

### Validation Rules
- ✅ Must contain `@` symbol
- ✅ Format: `[name]@[domain]`
- ✅ Case-insensitive alphanumeric
- ❌ Cannot start with `@`

---

## Step 3: Asset Selection

### What Should Happen
- Browse content items on `/app`
- Identify assets with pricing policies
- See "Purchase" button for paid content
- Free content shows no purchase button

### How to Test
1. Navigate to `/app`
2. Look for content cards with pricing badges
3. Find assets with these policies (from network logs):
   - `467d5bbc-a75c-426e-8e3a-3c4f0fce0701`: 50 QCT
   - `6f38d85e-4ef8-4a66-bbaa-d0b7e43ad5b4`: 15 QOYN
   - `7bf5ec13-23d9-43f8-ba67-a1377c2d5660`: 100 QCT
   - `89d7b22d-9435-4990-a421-63945f66fed0`: 25 QCT
   - `d4efe7ff-1a38-46c7-a685-8f6c9824549c`: 10 QCT

### Expected State
- **Asset Policies Loaded**: From `asset_policies` table
- **Entitlements Loaded**: From `entitlements` table
- **Purchase Button**: Only shown for assets without entitlements

---

## Step 4: Payment Flow

### What Should Happen
1. Click "Purchase" → Opens payment modal
2. Choose "Pay with Wallet" option
3. Balance check (enough QCT/QOYN?)
4. Create X402 quote (`/x402/quote`)
5. Sign transaction with wallet
6. Broadcast transaction (`/x402/send`)
7. Poll for settlement (`/x402/status/{txId}`)
8. Grant entitlement on settlement

### How to Test
1. Click "Purchase" on a paid asset
2. Select "Pay with Wallet" in the modal
3. Confirm the payment amount and asset
4. Click "Confirm Purchase"

### Expected Network Calls (in order)
```
POST /x402/quote
  Body: {to: "seller_did", amount: 10, asset: "QCT"}
  Response: {txId: "...", amount: 10, asset: "QCT", expires: "..."}

GET /x402/sign (not in mock - handled by signWithAgentiQ)
  Mock signature: sig_[base64_prefix]

POST /x402/send
  Body: {txId: "..."}
  Response: {success: true, txId: "..."}

GET /x402/status/{txId} (polling every 2s)
  Response: {txId: "...", status: "settled", amount: 10, asset: "QCT"}
```

### Expected State After Payment
- **Console Log**: `Payment successful! Transaction ID: ...`
- **Database**: New row in `entitlements` table
  ```sql
  SELECT * FROM entitlements 
  WHERE holder_user_id = 'current_user_id' 
    AND asset_id = 'purchased_asset_id';
  ```
- **UI**: "Purchase" button becomes "Access" or disappears
- **Wallet Balance**: Reduced by payment amount (100 QCT → 90 QCT if paid 10 QCT)

---

## Step 5: Entitlement Verification

### What Should Happen
- Entitlement row created in database
- User can now access the content
- Content gating respects the entitlement

### How to Test
1. After successful payment, check database:
   ```sql
   SELECT id, holder_did, asset_id, rights, created_at 
   FROM entitlements 
   WHERE holder_user_id = 'YOUR_USER_ID'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

2. Verify the purchased content is now accessible
3. Check that "Purchase" button no longer appears

### Expected Data
```json
{
  "id": "uuid",
  "holder_user_id": "current_user_id",
  "holder_did": "did:kn0w1:...",
  "asset_id": "purchased_asset_id",
  "rights": ["view", "stream"],
  "created_at": "2025-11-12T...",
  "expires_at": null,
  "tokenqube_id": null
}
```

---

## Debugging Tips

### Check Wallet State
Add to console:
```javascript
// Access wallet context in browser console
window.__WALLET_DEBUG__ = true;
```

### Monitor Network Requests
1. DevTools → Network tab
2. Filter: `wallet-mock` or `localhost:8080`
3. Watch for failed requests

### Check Database State
```sql
-- Check DIDs
SELECT * FROM did_identities WHERE user_id = 'YOUR_USER_ID';

-- Check entitlements
SELECT * FROM entitlements WHERE holder_user_id = 'YOUR_USER_ID';

-- Check asset policies
SELECT * FROM asset_policies WHERE price_amount > 0;

-- Check x402 transactions
SELECT * FROM x402_transactions ORDER BY created_at DESC LIMIT 10;
```

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| "Insufficient balance" | QCT/QOYN < price | Mock server gives 100 QCT, 42 QOYN - test with smaller amounts |
| "Failed to create quote" | Mock server not running | Start mock server on port 8080 |
| "Transaction timeout" | Polling failed | Check `/x402/status/{txId}` endpoint |
| "Entitlement not granted" | Edge function error | Check `aa-payments-notify` logs |
| "DID not found" | User has no DID | Should auto-create on wallet init |

---

## Success Criteria

✅ **Wallet initialized** with valid DID and balance  
✅ **FIO handle linked** in correct format (`name@domain`)  
✅ **Asset policies loaded** and displayed  
✅ **Payment processed** through x402 flow  
✅ **Entitlement granted** in database  
✅ **Content accessible** after purchase  
✅ **Balance updated** after payment  

---

## Next Steps After Testing

1. **Replace Mock Server**: Switch to real AgentiQ Wallet Service
   - Update `VITE_AGENTIQ_WALLET_BASE_URL` to production URL
   - Ensure proper authentication with production DIDs

2. **AigentZ SDK Integration**: Replace mock signing with real SDK
   - Install AigentZ SDK package
   - Implement proper key management
   - Integrate FIO handle registration flow

3. **Production Testing**: Test with real QCT/QOYN on testnet
   - Use actual wallet addresses
   - Test with real blockchain transactions
   - Verify settlement on-chain

4. **Analytics & Monitoring**: Add tracking for payment flows
   - Track conversion rates
   - Monitor failed payments
   - Alert on settlement issues
