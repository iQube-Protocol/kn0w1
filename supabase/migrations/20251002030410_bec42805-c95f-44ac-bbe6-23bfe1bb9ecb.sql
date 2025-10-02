-- Drop the existing global unique constraint on slug
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_slug_key;

-- Add a new composite unique constraint so slugs are unique per site
ALTER TABLE content_items ADD CONSTRAINT content_items_slug_agent_site_id_key UNIQUE (slug, agent_site_id);