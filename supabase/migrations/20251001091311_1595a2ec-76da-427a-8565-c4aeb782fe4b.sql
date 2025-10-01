-- 1. Drop old unique constraint on content_categories that blocks multi-site categories
ALTER TABLE public.content_categories 
DROP CONSTRAINT IF EXISTS content_categories_strand_slug_key;

-- 2. Add new unique constraint scoped to agent_site_id
ALTER TABLE public.content_categories 
ADD CONSTRAINT content_categories_agent_site_strand_slug_key 
UNIQUE (agent_site_id, strand, slug);

-- 3. Add seed tracking columns to agent_sites (optional but recommended)
ALTER TABLE public.agent_sites 
ADD COLUMN IF NOT EXISTS seeded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS seed_status TEXT DEFAULT 'pending' CHECK (seed_status IN ('pending', 'complete', 'failed'));

-- 4. Create index for better performance on seed_status queries
CREATE INDEX IF NOT EXISTS idx_agent_sites_seed_status ON public.agent_sites(seed_status);

-- 5. Update existing agent_sites to have 'pending' status if null
UPDATE public.agent_sites 
SET seed_status = 'pending' 
WHERE seed_status IS NULL;