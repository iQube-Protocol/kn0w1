-- Insert some sample content categories for testing
INSERT INTO public.content_categories (name, slug, description, strand, order_index) VALUES
('Getting Started', 'getting-started', 'Introduction and onboarding content', 'civic_readiness', 1),
('Voting Basics', 'voting-basics', 'Fundamental voting knowledge', 'civic_readiness', 2),
('Local Government', 'local-government', 'Understanding local governance', 'civic_readiness', 3),
('Crypto Fundamentals', 'crypto-fundamentals', 'Basic cryptocurrency education', 'learn_to_earn', 1),
('DeFi Basics', 'defi-basics', 'Decentralized finance introduction', 'learn_to_earn', 2),
('NFT Education', 'nft-education', 'Non-fungible token education', 'learn_to_earn', 3);