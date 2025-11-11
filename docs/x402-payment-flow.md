# x402 Payment Flow - Testing & Implementation Guide

## Overview
This document outlines the complete x402 payment implementation for content monetization in the MetaKNYT platform.

## Architecture

### 1. Database Schema

#### Tables
- **asset_policies**: Defines monetization policies for content items
  - `asset_id`: References content_items.id
  - `price_amount`: Price in specified asset
  - `price_asset`: Currency symbol (QCT, QOYN, etc.)
  - `rights`: Array of access rights (view, stream, download)
  - `visibility`: public/link/private
  - `pay_to_did`: Recipient DID for payments
  - `tokenqube_template`: Optional NFT template

- **x402_transactions**: Tracks payment transactions
  - `request_id`: Unique payment request identifier
  - `buyer_did`: Buyer's decentralized identifier
  - `seller_did`: Seller's decentralized identifier
  - `asset_id`: Content being purchased
  - `amount`: Payment amount
  - `asset_symbol`: Payment currency
  - `status`: initiated/pending/settled/failed/refunded
  - `facilitator_ref`: External payment reference

- **entitlements**: Grants access rights after successful payment
  - `x402_id`: References x402_transactions
  - `asset_id`: Content item granted
  - `holder_did`: Buyer's DID
  - `holder_user_id`: Buyer's user ID
  - `rights`: Access rights granted
  - `expires_at`: Optional expiration
  - `tokenqube_id`: Optional NFT token ID

- **did_identities**: Maps users to DIDs
  - `user_id`: User identifier
  - `did`: Decentralized identifier
  - `kybe_did`: Optional KYB DID
  - `agent_handle`: Optional agent handle

### 2. Edge Functions

#### aa-payments-quote
**Purpose**: Generate payment quotes with x402 protocol headers
- **Input**: `asset_id`, `buyer_did`, `dest_chain`, `asset_symbol`
- **Process**:
  1. Fetches asset policy
  2. Creates transaction record with 'initiated' status
  3. Calls `rpc_issue_quote` database function
  4. Returns x402 request with protocol headers
- **Output**: x402 request object + headers

#### aa-payments-notify
**Purpose**: Handle payment settlement notifications
- **Input**: `request_id`, `status`, `facilitator_ref`
- **Process**:
  1. Verifies transaction exists
  2. Calls `rpc_finalize_settlement` database function
  3. Updates transaction status
  4. Creates entitlement record on successful settlement
- **Output**: Settlement confirmation

#### aa-entitlements
**Purpose**: Check user entitlements and generate access URLs
- **Input**: `asset_id` (from URL path)
- **Process**:
  1. Authenticates user
  2. Queries entitlements table
  3. Generates signed storage URLs if download/stream rights exist
- **Output**: Access status + signed URLs

### 3. Database Functions

#### rpc_issue_quote
```sql
CREATE FUNCTION rpc_issue_quote(
  p_asset_id uuid,
  p_buyer_did text,
  p_dest_chain text,
  p_asset_symbol text
) RETURNS jsonb
```
Creates transaction record and returns x402 payment request

#### rpc_finalize_settlement
```sql
CREATE FUNCTION rpc_finalize_settlement(
  p_request_id text,
  p_facilitator_ref text,
  p_status text
) RETURNS jsonb
```
Updates transaction and creates entitlement on successful payment

## Frontend Components

### 1. AssetPolicyForm
**Location**: `src/components/admin/AssetPolicyForm.tsx`
**Purpose**: Admin UI for creating/editing asset policies
**Features**:
- Price configuration
- Rights selection (view/stream/download)
- Visibility settings
- Payment recipient DID
- TokenQube template (optional)

**Integration**: Embedded in ContentEditor sidebar

### 2. PurchaseButton
**Location**: `src/components/x402/PurchaseButton.tsx`
**Purpose**: User-facing purchase flow
**Features**:
- Displays pricing
- Generates payment QR code
- Polls for settlement
- Handles entitlement grant

**States**:
- `idle`: Initial state
- `pending`: Payment request generated, waiting for settlement
- `settled`: Payment complete, access granted

### 3. Content Gating

#### MediaPlayer
**Location**: `src/components/MediaPlayer.tsx`
**Gating Logic**:
- Accepts `hasAccess` prop
- Blocks Read/Watch buttons if `!hasAccess`
- Shows lock message for gated content

#### PDFViewer
**Location**: `src/components/PDFViewer.tsx`
**Gating Logic**:
- Accepts `hasAccess` prop
- Shows lock screen if `!hasAccess`
- Prevents PDF rendering without entitlement

#### MainApp
**Location**: `src/pages/MainApp.tsx`
**Integration**:
1. Fetches `asset_policies` for all content
2. Fetches user `entitlements`
3. Maps `hasAccess` to each content item
4. Passes to MediaCarousel and MediaPlayer

## Complete Flow

### Purchase Flow
1. **User clicks "Buy" button** on content
2. **PurchaseButton**:
   - Fetches/creates user DID
   - Calls `aa-payments-quote` edge function
   - Displays QR code with x402 payment request
3. **User scans QR** with x402-compatible wallet
4. **Wallet processes payment** and notifies callback URL
5. **aa-payments-notify** edge function:
   - Receives settlement notification
   - Updates transaction status to 'settled'
   - Creates entitlement record
6. **PurchaseButton polls** transaction status
7. **Access granted** - page refreshes with entitlement

### Access Control Flow
1. **MainApp loads**
2. **Fetches content items** with policies
3. **Fetches user entitlements**
4. **Maps hasAccess**:
   ```typescript
   hasAccess = !policy || policy.price_amount === 0 || hasEntitlement
   ```
5. **Passes to components**:
   - MediaCarousel shows/hides PurchaseButton
   - MediaPlayer blocks content actions
   - PDFViewer shows lock screen

## Testing Checklist

### Admin Setup
- [ ] Create content item
- [ ] Set asset policy with price > 0
- [ ] Verify policy saved correctly
- [ ] Check policy visible in AssetPolicyForm

### Purchase Flow
- [ ] Content shows as locked without entitlement
- [ ] Click "Buy" button opens dialog
- [ ] QR code displays with correct amount
- [ ] Payment request created in database
- [ ] Transaction status = 'initiated'

### Payment Settlement
- [ ] Simulate payment notification to `aa-payments-notify`
- [ ] Verify transaction status updates to 'settled'
- [ ] Verify entitlement created
- [ ] Verify entitlement.rights match policy.rights

### Access Grant
- [ ] Page refreshes after purchase
- [ ] Content shows as "Owned"
- [ ] Read/Watch buttons become enabled
- [ ] PDF viewer shows content
- [ ] MediaPlayer allows playback

### Edge Cases
- [ ] Free content (price_amount = 0) works without payment
- [ ] Already owned content shows "Owned" badge
- [ ] Unauthenticated users see purchase option
- [ ] Payment timeout handled gracefully
- [ ] Failed payments show error message

## Testing with Postman/curl

### 1. Generate Quote
```bash
curl -X POST \
  'https://ysykvckvggaqykhhntyo.supabase.co/functions/v1/aa-payments-quote' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "asset_id": "CONTENT_ITEM_UUID",
    "buyer_did": "did:iq:12345678",
    "dest_chain": "base.sepolia",
    "asset_symbol": "QCT"
  }'
```

### 2. Simulate Settlement
```bash
curl -X POST \
  'https://ysykvckvggaqykhhntyo.supabase.co/functions/v1/aa-payments-notify' \
  -H 'Content-Type: application/json' \
  -d '{
    "request_id": "REQUEST_ID_FROM_QUOTE",
    "status": "settled",
    "facilitator_ref": "test-txn-123"
  }'
```

### 3. Check Entitlement
```bash
curl -X GET \
  'https://ysykvckvggaqykhhntyo.supabase.co/functions/v1/aa-entitlements/CONTENT_ITEM_UUID' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Known Limitations

1. **DID Generation**: Currently uses temporary DIDs (`did:iq:{user_id}`). Production should integrate proper DID resolution.

2. **Wallet Integration**: QR code display only. Future: Direct wallet connect via Web3Modal or similar.

3. **Payment Verification**: Relies on callback notification. Production should verify on-chain settlement.

4. **Signed URLs**: 1-hour expiry for storage access. Consider shorter for download rights, longer for stream.

## Security Considerations

1. **RLS Policies**: All tables have appropriate Row-Level Security
2. **Service Role**: Only `aa-payments-notify` uses service role key
3. **CORS**: Configured for cross-origin requests
4. **JWT Verification**: Most endpoints require valid JWT
5. **Public Endpoints**: Only `aa-payments-notify` is public (for callbacks)

## Next Steps

1. **Integrate x402 Wallet SDK** for better UX
2. **Add payment history** page
3. **Support multiple currencies** (add more to ASSET_OPTIONS)
4. **Time-limited access** (implement expires_at checks)
5. **NFT minting** via TokenQube integration
6. **Refund flow** with status updates
