-- Phase 1: QubeBase Integration Schema
-- DID Identity Management (DiDQube anchored)
CREATE TABLE IF NOT EXISTS public.did_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,
  kybe_did TEXT,
  agent_handle TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on did_identities
ALTER TABLE public.did_identities ENABLE ROW LEVEL SECURITY;

-- Users can view their own DID
CREATE POLICY "Users can view own DID"
  ON public.did_identities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own DID
CREATE POLICY "Users can create own DID"
  ON public.did_identities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Asset policies for content monetization
CREATE TABLE IF NOT EXISTS public.asset_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  rights TEXT[] NOT NULL DEFAULT '{view,stream}',
  price_amount NUMERIC(18,8) DEFAULT 0,
  price_asset TEXT DEFAULT 'QCT',
  pay_to_did TEXT NOT NULL,
  tokenqube_template TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'link', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on asset_policies
ALTER TABLE public.asset_policies ENABLE ROW LEVEL SECURITY;

-- Content admins can manage policies
CREATE POLICY "Content admins can manage policies"
  ON public.asset_policies
  FOR ALL
  USING (has_admin_role(auth.uid(), 'super_admin'::admin_role) OR has_admin_role(auth.uid(), 'content_admin'::admin_role));

-- Anyone can view public/link policies
CREATE POLICY "Public can view accessible policies"
  ON public.asset_policies
  FOR SELECT
  USING (visibility IN ('public', 'link') OR has_admin_role(auth.uid(), 'content_admin'::admin_role));

-- x402 payment transactions
CREATE TABLE IF NOT EXISTS public.x402_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  buyer_did TEXT NOT NULL,
  seller_did TEXT NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  amount NUMERIC(18,8) NOT NULL,
  asset_symbol TEXT NOT NULL,
  src_chain TEXT,
  dest_chain TEXT,
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'settled', 'failed', 'refunded')),
  request_id TEXT UNIQUE NOT NULL,
  facilitator_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on x402_transactions
ALTER TABLE public.x402_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.x402_transactions
  FOR SELECT
  USING (
    buyer_did IN (SELECT did FROM public.did_identities WHERE user_id = auth.uid())
    OR seller_did IN (SELECT did FROM public.did_identities WHERE user_id = auth.uid())
    OR is_any_admin(auth.uid())
  );

-- System can create transactions
CREATE POLICY "System can create transactions"
  ON public.x402_transactions
  FOR INSERT
  WITH CHECK (true);

-- System can update transaction status
CREATE POLICY "System can update transactions"
  ON public.x402_transactions
  FOR UPDATE
  USING (true);

-- Entitlements (on-chain token or off-chain grant)
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x402_id UUID REFERENCES public.x402_transactions(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  holder_did TEXT NOT NULL,
  holder_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rights TEXT[] NOT NULL,
  tokenqube_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on entitlements
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- Users can view their own entitlements
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements
  FOR SELECT
  USING (auth.uid() = holder_user_id OR is_any_admin(auth.uid()));

-- System can create entitlements
CREATE POLICY "System can create entitlements"
  ON public.entitlements
  FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_did_identities_user_id ON public.did_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_did_identities_did ON public.did_identities(did);
CREATE INDEX IF NOT EXISTS idx_asset_policies_asset_id ON public.asset_policies(asset_id);
CREATE INDEX IF NOT EXISTS idx_x402_transactions_request_id ON public.x402_transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_x402_transactions_buyer_did ON public.x402_transactions(buyer_did);
CREATE INDEX IF NOT EXISTS idx_x402_transactions_status ON public.x402_transactions(status);
CREATE INDEX IF NOT EXISTS idx_entitlements_holder_user_id ON public.entitlements(holder_user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_asset_id ON public.entitlements(asset_id);

-- Helper functions for x402 integration
CREATE OR REPLACE FUNCTION public.rpc_issue_quote(
  p_asset_id UUID,
  p_buyer_did TEXT,
  p_dest_chain TEXT DEFAULT NULL,
  p_asset_symbol TEXT DEFAULT 'QCT'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy RECORD;
  v_request_id TEXT;
  v_seller_did TEXT;
BEGIN
  -- Get asset policy
  SELECT * INTO v_policy
  FROM public.asset_policies
  WHERE asset_id = p_asset_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset policy not found';
  END IF;

  -- Generate request ID
  v_request_id := gen_random_uuid()::TEXT;
  v_seller_did := v_policy.pay_to_did;

  -- Create transaction record
  INSERT INTO public.x402_transactions (
    buyer_did,
    seller_did,
    asset_id,
    amount,
    asset_symbol,
    dest_chain,
    status,
    request_id
  ) VALUES (
    p_buyer_did,
    v_seller_did,
    p_asset_id,
    v_policy.price_amount,
    COALESCE(p_asset_symbol, v_policy.price_asset),
    p_dest_chain,
    'initiated',
    v_request_id
  );

  -- Return x402 request
  RETURN jsonb_build_object(
    'version', '1.0',
    'request_id', v_request_id,
    'asset_symbol', COALESCE(p_asset_symbol, v_policy.price_asset),
    'amount', v_policy.price_amount::TEXT,
    'to_chain', p_dest_chain,
    'recipient', v_seller_did,
    'meta', jsonb_build_object(
      'asset_id', p_asset_id,
      'rights', v_policy.rights
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_finalize_settlement(
  p_request_id TEXT,
  p_facilitator_ref TEXT,
  p_status TEXT DEFAULT 'settled'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
  v_entitlement_id UUID;
  v_policy RECORD;
  v_holder_user_id UUID;
BEGIN
  -- Get transaction
  SELECT * INTO v_transaction
  FROM public.x402_transactions
  WHERE request_id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Update transaction status
  UPDATE public.x402_transactions
  SET status = p_status,
      facilitator_ref = p_facilitator_ref,
      updated_at = now()
  WHERE request_id = p_request_id;

  -- If settled, create entitlement
  IF p_status = 'settled' THEN
    -- Get policy
    SELECT * INTO v_policy
    FROM public.asset_policies
    WHERE asset_id = v_transaction.asset_id
    LIMIT 1;

    -- Get holder user_id from DID
    SELECT user_id INTO v_holder_user_id
    FROM public.did_identities
    WHERE did = v_transaction.buyer_did
    LIMIT 1;

    -- Create entitlement
    INSERT INTO public.entitlements (
      x402_id,
      asset_id,
      holder_did,
      holder_user_id,
      rights
    ) VALUES (
      v_transaction.id,
      v_transaction.asset_id,
      v_transaction.buyer_did,
      v_holder_user_id,
      v_policy.rights
    )
    RETURNING id INTO v_entitlement_id;

    RETURN jsonb_build_object(
      'success', true,
      'entitlement_id', v_entitlement_id,
      'status', p_status
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'status', p_status
    );
  END IF;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_did_identities_updated_at
  BEFORE UPDATE ON public.did_identities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_asset_policies_updated_at
  BEFORE UPDATE ON public.asset_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_x402_transactions_updated_at
  BEFORE UPDATE ON public.x402_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();