-- Create test entitlements to verify the Purchases page works
-- This simulates a user having purchased content (using correct schema without updated_at)

-- Free content entitlement
INSERT INTO entitlements (
  holder_user_id,
  holder_did,
  asset_id,
  rights,
  created_at
)
SELECT 
  'd9c02ee4-a13f-43ad-8321-576bfbee04de' as holder_user_id,
  'did:iq:d9c02ee4' as holder_did,
  asset_id,
  rights,
  now() as created_at
FROM asset_policies
WHERE asset_id = '2bf7055c-d079-4e01-9d37-af4b487e3b2f' -- Free content (0 QCT)
LIMIT 1;

-- Paid content entitlement  
INSERT INTO entitlements (
  holder_user_id,
  holder_did,
  asset_id,
  rights,
  created_at
)
SELECT 
  'd9c02ee4-a13f-43ad-8321-576bfbee04de' as holder_user_id,
  'did:iq:d9c02ee4' as holder_did,
  asset_id,
  rights,
  now() as created_at
FROM asset_policies
WHERE asset_id = 'd4efe7ff-1a38-46c7-a685-8f6c9824549c' -- 10 QCT content
LIMIT 1;