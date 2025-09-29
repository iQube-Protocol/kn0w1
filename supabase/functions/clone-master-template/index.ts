import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type definitions for database operations
interface ContentCategory {
  id?: string;
  name: string;
  slug: string;
  strand: string;
  description: string;
  agent_site_id: string;
}

interface MissionPillar {
  id?: string;
  display_name: string;
  short_summary: string;
  long_context_md: string;
  goals_json: string[];
  kpis_json: string[];
  agent_site_id: string;
}

interface ContentItem {
  id?: string;
  title: string;
  description: string;
  slug: string;
  type: string;
  strand: string;
  status: string;
  category: string;
  l2e_points: number;
  featured?: boolean;
  tags: string[];
  agent_site_id: string;
  category_id?: string;
  owner_id: string;
  accessibility_json: object;
  analytics_json: object;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agentSiteId, userEmail } = await req.json();

    console.log(`Cloning master template for agent site: ${agentSiteId}`);

    // Master template content based on METAKNYT sample data
    const masterContent = [
      {
        title: "THE GENESIS BLOCK",
        description: "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating.",
        slug: "the-genesis-block",
        type: "text",
        strand: "knytbook",
        status: "published",
        category: "Episode",
        l2e_points: 25,
        featured: true,
        tags: ["Genesis", "Story", "Featured"]
      },
      {
        title: "Digital Genesis Protocol",
        description: "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating.",
        slug: "digital-genesis-protocol",
        type: "video",
        strand: "knytbook", 
        status: "published",
        category: "Episode",
        l2e_points: 25,
        tags: ["Video", "Protocol", "Digital"]
      },
      {
        title: "Cosmic Nexus Archives",
        description: "Explore the mysteries of the cosmic nexus and unlock ancient secrets hidden in the digital archives.",
        slug: "cosmic-nexus-archives",
        type: "text",
        strand: "learn_to_earn",
        status: "published", 
        category: "Guide",
        l2e_points: 18,
        tags: ["Archive", "Guide", "Cosmic"]
      },
      {
        title: "MetaKnight Chronicles",
        description: "Follow the legendary MetaKnight on an epic journey through the digital realms of Terra.",
        slug: "metaknight-chronicles",
        type: "video",
        strand: "knytbook",
        status: "published",
        category: "Series", 
        l2e_points: 30,
        featured: true,
        tags: ["Chronicle", "Series", "Epic"]
      },
      {
        title: "Blockchain Fundamentals",
        description: "Master the foundational concepts of blockchain technology and decentralized systems.",
        slug: "blockchain-fundamentals", 
        type: "text",
        strand: "learn_to_earn",
        status: "published",
        category: "Education",
        l2e_points: 15,
        tags: ["Blockchain", "Education", "Fundamentals"]
      },
      {
        title: "DeFi Deep Dive",
        description: "Comprehensive guide to decentralized finance protocols and yield farming strategies.",
        slug: "defi-deep-dive",
        type: "video",
        strand: "learn_to_earn",
        status: "published",
        category: "Tutorial",
        l2e_points: 20,
        tags: ["DeFi", "Tutorial", "Finance"]
      },
      {
        title: "Quantum Mining Expedition", 
        description: "Join the most dangerous mining expedition into the quantum depths of Terra's digital underground.",
        slug: "quantum-mining-expedition",
        type: "video",
        strand: "knytbook",
        status: "published",
        category: "Episode",
        l2e_points: 45,
        featured: true,
        tags: ["Mining", "Quantum", "Adventure"]
      },
      {
        title: "Crypto Trading Mastery",
        description: "Advanced trading strategies for navigating volatile cryptocurrency markets with confidence.",
        slug: "crypto-trading-mastery",
        type: "text", 
        strand: "learn_to_earn",
        status: "published",
        category: "Guide",
        l2e_points: 22,
        tags: ["Trading", "Crypto", "Strategy"]
      },
      {
        title: "The Shadow Protocol",
        description: "Uncover the mysterious Shadow Protocol that threatens to reshape the digital landscape forever.",
        slug: "the-shadow-protocol",
        type: "video",
        strand: "knytbook",
        status: "published",
        category: "Series",
        l2e_points: 35,
        tags: ["Protocol", "Mystery", "Shadow"]
      },
      {
        title: "Smart Contract Security", 
        description: "Essential security practices for developing and auditing smart contracts on various blockchain platforms.",
        slug: "smart-contract-security",
        type: "text",
        strand: "learn_to_earn", 
        status: "published",
        category: "Education",
        l2e_points: 18,
        tags: ["Security", "Smart Contracts", "Development"]
      },
      {
        title: "NFT Creation Workshop",
        description: "Step-by-step guide to creating, minting, and marketing your own NFT collections.",
        slug: "nft-creation-workshop",
        type: "video",
        strand: "learn_to_earn",
        status: "published", 
        category: "Tutorial",
        l2e_points: 25,
        tags: ["NFT", "Workshop", "Creation"]
      },
      {
        title: "Digital Rebellion",
        description: "The resistance begins as digital citizens fight back against the oppressive Data Lords.",
        slug: "digital-rebellion",
        type: "video",
        strand: "knytbook",
        status: "published",
        category: "Episode", 
        l2e_points: 28,
        tags: ["Rebellion", "Story", "Resistance"]
      },
      {
        title: "DAO Governance Guide",
        description: "Understanding decentralized autonomous organizations and participating in community governance.",
        slug: "dao-governance-guide",
        type: "text",
        strand: "learn_to_earn",
        status: "published",
        category: "Education",
        l2e_points: 20,
        tags: ["DAO", "Governance", "Community"]
      }
    ];

    // Create default categories first
    const categories = [
      { name: "Episode", slug: "episode", strand: "knytbook", description: "Story episodes and narrative content" },
      { name: "Series", slug: "series", strand: "knytbook", description: "Multi-part story series" },
      { name: "Education", slug: "education", strand: "learn_to_earn", description: "Educational content and courses" },
      { name: "Tutorial", slug: "tutorial", strand: "learn_to_earn", description: "Step-by-step tutorials" },
      { name: "Guide", slug: "guide", strand: "learn_to_earn", description: "Comprehensive guides and how-tos" }
    ];

    const categoryResults: { id: string; slug: string }[] = [];
    for (const category of categories) {
      const { data: existingCategory } = await supabaseClient
        .from('content_categories')
        .select('id, slug')
        .eq('agent_site_id', agentSiteId)
        .eq('slug', category.slug)
        .maybeSingle();

      if (!existingCategory) {
        const { data: newCategory, error } = await supabaseClient
          .from('content_categories')
          .insert({
            ...category,
            agent_site_id: agentSiteId
          })
          .select('id, slug')
          .single();

        if (error) {
          console.error('Error creating category:', error);
          continue;
        }
        if (newCategory) categoryResults.push(newCategory);
      } else {
        categoryResults.push(existingCategory);
      }
    }

    // Create a category mapping
    const categoryMap = new Map();
    for (const cat of categoryResults) {
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    }

    // Create default mission pillars
    const pillars = [
      {
        display_name: "KNYT Universe",
        short_summary: "Immersive storytelling and narrative experiences",
        long_context_md: "The KNYT Universe pillar focuses on creating immersive storytelling experiences through digital comics, interactive narratives, and episodic content that engages users in the Terra digital realm.",
        goals_json: ["Engage users with compelling narratives", "Build connected story universe", "Foster community discussion"],
        kpis_json: ["Story completion rates", "User engagement time", "Community interaction metrics"]
      },
      {
        display_name: "Learn to Earn",
        short_summary: "Educational content with reward systems",
        long_context_md: "The Learn to Earn pillar combines educational content with incentive systems, allowing users to gain knowledge about blockchain, crypto, and Web3 technologies while earning rewards for their learning progress.",
        goals_json: ["Educate users on Web3 technologies", "Incentivize learning completion", "Build skilled community"],
        kpis_json: ["Course completion rates", "Quiz scores", "Points earned distribution"]
      }
    ];

    const pillarResults: { id: string; display_name: string }[] = [];
    for (const pillar of pillars) {
      const { data: newPillar, error } = await supabaseClient
        .from('mission_pillars')
        .insert({
          ...pillar,
          agent_site_id: agentSiteId
        })
        .select('id, display_name')
        .single();

      if (error) {
        console.error('Error creating pillar:', error);
        continue;
      }
      if (newPillar) pillarResults.push(newPillar);
    }

    // Get the site owner for content ownership
    const { data: agentSite } = await supabaseClient
      .from('agent_sites')
      .select('owner_user_id')
      .eq('id', agentSiteId)
      .single();

    if (!agentSite) {
      throw new Error('Agent site not found');
    }

    // Create content items
    const contentResults: { id: string; title: string }[] = [];
    for (const content of masterContent) {
      const categoryId = categoryMap.get(content.category.toLowerCase());
      
      const { data: newContent, error } = await supabaseClient
        .from('content_items')
        .insert({
          ...content,
          agent_site_id: agentSiteId,
          category_id: categoryId,
          owner_id: agentSite.owner_user_id,
          accessibility_json: {},
          analytics_json: {}
        })
        .select('id, title')
        .single();

      if (error) {
        console.error('Error creating content:', error);
        continue;
      }
      if (newContent) contentResults.push(newContent);
    }

    console.log(`Successfully cloned master template: ${contentResults.length} content items, ${categoryResults.length} categories, ${pillarResults.length} pillars`);

    return new Response(
      JSON.stringify({
        success: true,
        created: {
          content_items: contentResults.length,
          categories: categoryResults.length,
          pillars: pillarResults.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in clone-master-template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});