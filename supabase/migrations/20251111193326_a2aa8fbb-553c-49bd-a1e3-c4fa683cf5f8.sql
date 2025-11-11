-- Insert test asset policies for existing content
-- Note: In production, these should be created through the admin UI

-- Free content (price = 0)
INSERT INTO asset_policies (asset_id, price_amount, price_asset, rights, visibility, pay_to_did)
VALUES 
  ('2bf7055c-d079-4e01-9d37-af4b487e3b2f', 0, 'QCT', ARRAY['view', 'stream'], 'public', 'did:iq:test-seller');

-- Paid content with various prices
INSERT INTO asset_policies (asset_id, price_amount, price_asset, rights, visibility, pay_to_did)
VALUES 
  ('d4efe7ff-1a38-46c7-a685-8f6c9824549c', 10, 'QCT', ARRAY['view', 'stream'], 'public', 'did:iq:test-seller'),
  ('89d7b22d-9435-4990-a421-63945f66fed0', 25, 'QCT', ARRAY['view', 'stream', 'download'], 'public', 'did:iq:test-seller'),
  ('6f38d85e-4ef8-4a66-bbaa-d0b7e43ad5b4', 15, 'QOYN', ARRAY['view', 'stream'], 'public', 'did:iq:test-seller'),
  ('467d5bbc-a75c-426e-8e3a-3c4f0fce0701', 50, 'QCT', ARRAY['view', 'stream', 'download'], 'link', 'did:iq:test-seller'),
  ('7bf5ec13-23d9-43f8-ba67-a1377c2d5660', 100, 'QCT', ARRAY['view', 'stream', 'download'], 'public', 'did:iq:test-seller');

-- Leave some content without policies to test the "no policy = free" logic