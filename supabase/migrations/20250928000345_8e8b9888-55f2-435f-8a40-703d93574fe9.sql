-- Create user roles table with proper admin roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'content_admin', 'social_admin', 'moderator');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin roles
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_admin_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create content strands enum
CREATE TYPE content_strand AS ENUM ('civic_readiness', 'learn_to_earn');

-- Create content status enum
CREATE TYPE content_status AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived');

-- Create content type enum
CREATE TYPE content_type AS ENUM ('audio', 'video', 'text', 'pdf', 'image', 'mixed', 'social');

-- Create categories table
CREATE TABLE IF NOT EXISTS public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strand content_strand NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(strand, slug)
);

-- Enable RLS
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- Create comprehensive content_items table (replacing media_content)
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  strand content_strand NOT NULL,
  category_id UUID REFERENCES public.content_categories(id),
  tags TEXT[] DEFAULT '{}',
  type content_type NOT NULL,
  status content_status DEFAULT 'draft',
  publish_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  cover_image_id UUID,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Social mirrors
  social_source TEXT,
  social_url TEXT,
  social_embed_html TEXT,
  og_json JSONB,
  
  -- Accessibility
  has_captions BOOLEAN DEFAULT false,
  has_transcript BOOLEAN DEFAULT false,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  
  -- Learn to Earn
  l2e_points INTEGER DEFAULT 0,
  l2e_quiz_url TEXT,
  l2e_cta_label TEXT,
  l2e_cta_url TEXT,
  
  -- Future Phase 2 fields
  iqube_policy_json JSONB,
  content_qube_id TEXT,
  token_qube_ref TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Create media assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  kind content_type NOT NULL,
  storage_path TEXT,
  external_url TEXT,
  oembed_html TEXT,
  duration_seconds INTEGER,
  width INTEGER,
  height INTEGER,
  transcript_path TEXT,
  caption_path TEXT,
  checksum TEXT,
  filesize_bytes BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT media_assets_source_check CHECK (
    (storage_path IS NOT NULL AND external_url IS NULL) OR
    (storage_path IS NULL AND external_url IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Create social connections table
CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('twitter', 'instagram', 'tiktok', 'youtube', 'discord', 'telegram')),
  connected BOOLEAN DEFAULT false,
  account_handle TEXT,
  oauth_meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create user content progress table
CREATE TABLE IF NOT EXISTS public.user_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_item_id)
);

-- Enable RLS
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content management

-- Categories policies
CREATE POLICY "Anyone can view published categories"
  ON public.content_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Content admins can manage categories"
  ON public.content_categories
  FOR ALL
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

-- Content items policies
CREATE POLICY "Anyone can view published content"
  ON public.content_items
  FOR SELECT
  USING (status = 'published' OR public.is_any_admin(auth.uid()));

CREATE POLICY "Content admins can manage content"
  ON public.content_items
  FOR ALL
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

-- Media assets policies
CREATE POLICY "Users can view assets for accessible content"
  ON public.media_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_items ci 
      WHERE ci.id = content_item_id 
      AND (ci.status = 'published' OR public.is_any_admin(auth.uid()))
    )
  );

CREATE POLICY "Content admins can manage media assets"
  ON public.media_assets
  FOR ALL
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

-- Social connections policies
CREATE POLICY "Social admins can manage connections"
  ON public.social_connections
  FOR ALL
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'social_admin')
  );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_any_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON public.user_content_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_content_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_content_categories_updated_at
  BEFORE UPDATE ON public.content_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_content_progress_updated_at
  BEFORE UPDATE ON public.user_content_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.content_categories (strand, name, slug, description, order_index) VALUES
('civic_readiness', 'Voting & Elections', 'voting-elections', 'Content about voting processes, elections, and civic participation', 1),
('civic_readiness', 'Government & Policy', 'government-policy', 'Understanding government structure and policy-making', 2),
('civic_readiness', 'Community Engagement', 'community-engagement', 'Local community involvement and activism', 3),
('learn_to_earn', 'Blockchain Basics', 'blockchain-basics', 'Fundamental concepts of blockchain technology', 1),
('learn_to_earn', 'DeFi Education', 'defi-education', 'Decentralized finance concepts and protocols', 2),
('learn_to_earn', 'NFT & Digital Assets', 'nft-digital-assets', 'Understanding NFTs and digital asset ownership', 3)
ON CONFLICT (strand, slug) DO NOTHING;