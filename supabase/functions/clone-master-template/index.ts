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

    // Mark seeding as pending at start
    await supabaseClient
      .from('agent_sites')
      .update({ seed_status: 'pending' })
      .eq('id', agentSiteId);
    const masterContent = [
      {
        title: "THE GENESIS BLOCK",
        description: "Step into the heart of the MetaKNYT universe with this groundbreaking interactive experience. Discover the epic battle between The Fang and The Bat, explore stunning digital landscapes, and unlock the secrets of Terra's ancient prophecies.",
        slug: "the-genesis-block",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "epic-stories",
        l2e_points: 50,
        featured: true,
        pinned: true,
        tags: ["genesis", "story", "interactive"],
        social_source: "YouTube",
        social_url: "https://www.youtube.com/embed/example1",
        social_embed_html: `<div class="relative w-full pb-[56.25%]"><iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/example1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      },
      {
        title: "Blockchain Fundamentals",
        description: "Master the core concepts of blockchain technology through engaging video lessons, interactive quizzes, and real-world case studies. Perfect for beginners and those looking to strengthen their Web3 foundation.",
        slug: "blockchain-fundamentals",
        type: "video",
        strand: "learn_to_earn",
        status: "published",
        category: "masterclass",
        l2e_points: 100,
        featured: true,
        tags: ["blockchain", "education", "fundamentals"],
        l2e_quiz_url: "https://quiz.metaknyt.com/blockchain-basics",
        l2e_cta_label: "Start Learning",
        l2e_cta_url: "https://learn.metaknyt.com/blockchain"
      },
      {
        title: "DeFi Deep Dive",
        description: "Explore the world of Decentralized Finance with comprehensive tutorials on protocols, yield farming, liquidity provision, and risk management. Includes live trading demonstrations and expert analysis.",
        slug: "defi-deep-dive",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "masterclass",
        l2e_points: 150,
        featured: true,
        tags: ["defi", "finance", "trading"],
        social_source: "Twitter",
        social_url: "https://twitter.com/metaknyt/status/123456",
        social_embed_html: `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🚀 New DeFi course dropping! Learn advanced yield strategies from industry experts 📊 <a href="https://twitter.com/hashtag/DeFi?src=hash&amp;ref_src=twsrc%5Etfw">#DeFi</a> <a href="https://twitter.com/hashtag/Web3?src=hash&amp;ref_src=twsrc%5Etfw">#Web3</a></p>&mdash; MetaKNYT (@metaknyt)</blockquote>`
      },
      {
        title: "MetaKnight Chronicles: Episode 1",
        description: "Join MetaKnight on an epic journey through Terra's digital realms in this cinematic series premiere. Featuring stunning visuals, original score, and branching narratives that respond to community choices.",
        slug: "metaknight-chronicles-ep1",
        type: "video",
        strand: "civic_readiness",
        status: "published",
        category: "epic-stories",
        l2e_points: 75,
        featured: true,
        pinned: true,
        tags: ["metaknight", "series", "story"],
        l2e_quiz_url: "https://quiz.metaknyt.com/metaknight-ep1",
        l2e_cta_label: "Watch Episode",
        l2e_cta_url: "https://watch.metaknyt.com/chronicles/1"
      },
      {
        title: "Smart Contract Security",
        description: "Learn to identify and prevent common vulnerabilities in smart contracts. This intensive bootcamp covers auditing techniques, best practices, and includes hands-on exercises with real contract examples.",
        slug: "smart-contract-security",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "bootcamp",
        l2e_points: 200,
        tags: ["security", "smart-contracts", "auditing"],
        l2e_quiz_url: "https://quiz.metaknyt.com/security-assessment",
        l2e_cta_label: "Join Bootcamp",
        l2e_cta_url: "https://bootcamp.metaknyt.com/security"
      },
      {
        title: "NFT Creation Workshop",
        description: "Transform your creative vision into NFTs with this comprehensive workshop. Covers art creation, metadata standards, smart contract deployment, and marketing strategies for successful launches.",
        slug: "nft-creation-workshop",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "workshop",
        l2e_points: 125,
        featured: true,
        tags: ["nft", "creation", "workshop"],
        social_source: "Instagram",
        social_url: "https://instagram.com/p/nft-workshop",
        social_embed_html: `<blockquote class="instagram-media" data-instgrm-permalink="https://instagram.com/p/nft-workshop"><div style="padding:16px;"><p>🎨 NFT Workshop starts next week! Join us to learn the complete creation pipeline from concept to marketplace 🚀</p></div></blockquote>`
      },
      {
        title: "The Shadow Protocol",
        description: "Unravel the mysteries of the Shadow Protocol in this interactive documentary. Features real blockchain forensics, investigative journalism, and exclusive interviews with cybersecurity experts.",
        slug: "the-shadow-protocol",
        type: "video",
        strand: "civic_readiness",
        status: "published",
        category: "documentary",
        l2e_points: 90,
        featured: true,
        tags: ["mystery", "investigation", "protocol"]
      },
      {
        title: "DAO Governance Masterclass",
        description: "Deep dive into decentralized governance structures, voting mechanisms, and token economics. Includes case studies from leading DAOs and templates for launching your own organization.",
        slug: "dao-governance-masterclass",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "masterclass",
        l2e_points: 110,
        tags: ["dao", "governance", "community"],
        l2e_quiz_url: "https://quiz.metaknyt.com/dao-governance",
        l2e_cta_label: "Start Course",
        l2e_cta_url: "https://learn.metaknyt.com/dao"
      },
      {
        title: "Crypto Trading Mastery",
        description: "Master technical analysis, risk management, and trading psychology with this comprehensive course. Includes backtesting tools, live trading sessions, and exclusive access to our trading community.",
        slug: "crypto-trading-mastery",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        category: "masterclass",
        l2e_points: 175,
        tags: ["trading", "crypto", "technical-analysis"],
        social_source: "YouTube",
        social_url: "https://www.youtube.com/embed/trading-course",
        social_embed_html: `<div class="relative w-full pb-[56.25%]"><iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/trading-course" frameborder="0" allowfullscreen></iframe></div>`
      },
      {
        title: "Web3 Social Impact",
        description: "Explore how blockchain can solve real-world problems. Features case studies on climate action, financial inclusion, and digital identity, plus grant opportunities for impact projects.",
        slug: "web3-social-impact",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        category: "impact-projects",
        l2e_points: 80,
        tags: ["social-impact", "climate", "inclusion"]
      },
      {
        title: "Digital Rebellion: The Resistance",
        description: "An interactive storyline where your choices shape the future of Terra's rebellion. Features multiple endings, character progression, and collaborative storytelling with the community.",
        slug: "digital-rebellion",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        category: "epic-stories",
        l2e_points: 95,
        featured: true,
        tags: ["rebellion", "interactive", "story"],
        social_source: "TikTok",
        social_url: "https://tiktok.com/@metaknyt/rebellion",
        social_embed_html: `<div class="aspect-video bg-gradient-to-br from-red-900 to-orange-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">⚡ JOIN THE RESISTANCE ⚡</div>`
      },
      {
        title: "Quantum Mining Expedition",
        description: "Experience Terra's most dangerous mining expedition in this immersive VR-compatible adventure. Collect rare artifacts, compete on global leaderboards, and uncover quantum secrets.",
        slug: "quantum-mining-expedition",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        category: "epic-stories",
        l2e_points: 130,
        tags: ["mining", "adventure", "vr"]
      },
      {
        title: "Layer 2 Scaling Solutions",
        description: "Comprehensive guide to Ethereum Layer 2 technologies including rollups, sidechains, and state channels. Hands-on tutorials for deploying and interacting with L2 protocols.",
        slug: "layer-2-scaling",
        type: "video",
        strand: "learn_to_earn",
        status: "published",
        category: "masterclass",
        l2e_points: 140,
        tags: ["layer2", "scaling", "ethereum"],
        l2e_quiz_url: "https://quiz.metaknyt.com/layer2",
        l2e_cta_label: "Learn L2",
        l2e_cta_url: "https://learn.metaknyt.com/layer2"
      },
      {
        title: "Community Building for Web3",
        description: "Learn proven strategies for growing and engaging Web3 communities. Covers Discord management, token-gated access, ambassador programs, and sustainable growth tactics.",
        slug: "community-building-web3",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        category: "workshop",
        l2e_points: 85,
        tags: ["community", "growth", "engagement"],
        l2e_cta_label: "Join Workshop",
        l2e_cta_url: "https://workshop.metaknyt.com/community"
      }
    ];

    // Create default categories - ACTUAL categories from https://metaknyt.lovable.app/
    const categories = [
      { name: "Epic Stories", slug: "epic-stories", strand: "civic_readiness", description: "Immersive narratives and interactive adventures that transport you to the MetaKNYT universe" },
      { name: "Masterclass", slug: "masterclass", strand: "learn_to_earn", description: "Comprehensive courses covering blockchain, DeFi, trading, and Web3 fundamentals" },
      { name: "Workshop", slug: "workshop", strand: "learn_to_earn", description: "Hands-on sessions for building practical skills in NFTs, community management, and more" },
      { name: "Bootcamp", slug: "bootcamp", strand: "learn_to_earn", description: "Intensive training programs for security, development, and advanced Web3 topics" },
      { name: "Documentary", slug: "documentary", strand: "civic_readiness", description: "Investigative deep-dives into protocols, technologies, and blockchain mysteries" },
      { name: "Impact Projects", slug: "impact-projects", strand: "civic_readiness", description: "Real-world applications of blockchain for social good and community impact" }
    ];

    // Upsert categories for this site (idempotent)
    const categoriesWithSite = categories.map((c) => ({ ...c, agent_site_id: agentSiteId }));
    const { data: upsertedCats, error: catUpsertError } = await supabaseClient
      .from('content_categories')
      .upsert(categoriesWithSite, { onConflict: 'agent_site_id,strand,slug' })
      .select('id, slug');

    if (catUpsertError) {
      console.error('Error upserting categories:', catUpsertError);
    }

    // Create a category mapping
    const categoryMap = new Map<string, string>();
    for (const cat of upsertedCats || []) {
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    }

    // Create default mission pillars - ACTUAL pillars from https://metaknyt.lovable.app/
    const pillars = [
      {
        display_name: "Learn to Earn",
        short_summary: "Transform your Web3 learning journey into tangible rewards through comprehensive courses, workshops, and hands-on experiences",
        long_context_md: `# Learn to Earn: Web3 Education Reimagined

## Mission
The Learn to Earn pillar revolutionizes blockchain education by combining high-quality learning content with tokenized incentives. Every course completed, every skill mastered, and every milestone achieved earns you rewards while building your Web3 expertise.

## Core Offerings

### Masterclasses
Deep-dive comprehensive courses covering:
- **Blockchain Fundamentals**: Master core concepts and protocols
- **DeFi Strategies**: Advanced trading and yield optimization
- **DAO Governance**: Decentralized organization management
- **Smart Contract Development**: Build secure, efficient code

### Workshops
Hands-on sessions including:
- **NFT Creation**: From concept to marketplace launch
- **Community Building**: Grow engaged Web3 communities
- **Content Strategy**: Build your Web3 brand
- **Token Economics**: Design sustainable tokenomics

### Bootcamps
Intensive training programs:
- **Security Auditing**: Identify vulnerabilities in smart contracts
- **Full-Stack Web3**: Build complete dApps
- **Layer 2 Development**: Deploy on scaling solutions

## Earning Opportunities
- **Course Completion**: 50-200 points per course
- **Quiz Excellence**: Bonus rewards for perfect scores
- **Community Contributions**: Share knowledge, earn rewards
- **Project Submissions**: Showcase your work for premium rewards

## Learning Paths
Structured progressions from beginner to expert:
1. **Foundation Track**: Web3 basics → Blockchain fundamentals → First dApp
2. **DeFi Specialist**: Protocol analysis → Trading strategies → Risk management
3. **Creator Track**: NFT basics → Smart contracts → Community building
4. **Developer Track**: Solidity → Testing → Production deployment`,
        goals_json: [
          "Democratize access to high-quality Web3 education",
          "Create clear pathways from learning to earning",
          "Build a global community of skilled Web3 professionals",
          "Reward continuous learning and skill development"
        ],
        kpis_json: [
          "Course completion rates",
          "Average learning outcomes assessment scores",
          "Community engagement and participation",
          "Career advancement of graduates"
        ]
      },
      {
        display_name: "Civic Readiness",
        short_summary: "Prepare for active participation in decentralized governance and digital communities through immersive stories and real-world projects",
        long_context_md: `# Civic Readiness: Building Digital Citizens

## Mission
The Civic Readiness pillar prepares individuals for meaningful participation in decentralized societies through engaging narratives, interactive experiences, and real-world impact projects.

## Core Experiences

### Epic Stories
Immersive narratives that teach through experience:
- **The Genesis Block**: Origin story of the MetaKNYT universe
- **MetaKnight Chronicles**: Hero's journey through digital realms
- **Digital Rebellion**: Choose-your-own-adventure governance simulation
- **Quantum Mining Expedition**: Resource management and collaboration

### Documentary Series
Investigative content exploring:
- **The Shadow Protocol**: Blockchain forensics and security
- **DAO Case Studies**: Real governance in action
- **Protocol Deep Dives**: How major platforms work
- **Impact Reports**: Blockchain solving real problems

### Impact Projects
Community-driven initiatives:
- **Climate Action DAOs**: Funding environmental solutions
- **Financial Inclusion**: Banking the unbanked with DeFi
- **Digital Identity**: Self-sovereign identity systems
- **Community Funding**: Decentralized grants and support

## Participation Framework

### Governance Training
- Understanding voting mechanisms
- Proposal creation and advocacy
- Consensus building strategies
- Conflict resolution in DAOs

### Community Leadership
- Organizing local meetups
- Running online communities
- Ambassador programs
- Educational outreach

### Real-World Application
- Participate in DAO governance
- Launch community initiatives
- Contribute to public goods
- Build local Web3 ecosystems

## Impact Metrics
- **Governance Participation**: Active voters in partner DAOs
- **Community Growth**: Size and engagement of local chapters
- **Project Launches**: Community-initiated impact projects
- **Cross-Collaboration**: Partnerships between communities`,
        goals_json: [
          "Develop informed, engaged digital citizens",
          "Bridge Web3 concepts with real-world governance",
          "Create measurable social and environmental impact",
          "Build resilient, self-governing communities"
        ],
        kpis_json: [
          "DAO governance participation rates",
          "Community project launches and outcomes",
          "Social impact metrics (lives improved, carbon offset, etc.)",
          "Cross-community collaboration events"
        ]
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
      .select('id, owner_user_id')
      .eq('id', agentSiteId)
      .single();

    if (!agentSite) {
      throw new Error('Agent site not found');
    }

    // Ensure owner has super_admin role for this site (idempotent)
    const { data: existingRole } = await supabaseClient
      .from('user_roles')
      .select('id')
      .eq('user_id', agentSite.owner_user_id)
      .eq('agent_site_id', agentSiteId)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (!existingRole) {
      await supabaseClient
        .from('user_roles')
        .insert({ user_id: agentSite.owner_user_id, role: 'super_admin', agent_site_id: agentSiteId });
    }

    // Create content items  
    const contentResults: { id: string; title: string }[] = [];
    for (const content of masterContent) {
      // Prefer explicit category from template; fallback to simple mapping
      let categorySlug = (content as any).category?.toLowerCase?.() || 'masterclass';
      if (!categoryMap.has(categorySlug)) {
        if (content.type === 'mixed' && content.strand === 'civic_readiness') {
          categorySlug = 'epic-stories';
        } else if (content.strand === 'learn_to_earn') {
          if ((content.tags || []).includes('bootcamp')) categorySlug = 'bootcamp';
          else if ((content.tags || []).includes('workshop')) categorySlug = 'workshop';
          else categorySlug = 'masterclass';
        } else if (content.strand === 'civic_readiness') {
          categorySlug = 'epic-stories';
        }
      }
      
      const categoryId = categoryMap.get(categorySlug);
      
      const { data: newContent, error } = await supabaseClient
        .from('content_items')
        .insert({
          ...content,
          agent_site_id: agentSiteId,
          category_id: categoryId,
          owner_id: agentSite.owner_user_id,
          accessibility_json: { 
            alt_text_available: true,
            closed_captions: content.type === 'video' || content.type === 'mixed',
            audio_description: content.type === 'video',
            keyboard_navigation: true
          },
          analytics_json: {
            view_tracking: true,
            engagement_metrics: true,
            completion_tracking: true,
            social_sharing: true
          }
        })
        .select('id, title')
        .single();

      if (error) {
        console.error('Error creating content:', error);
        continue;
      }
      if (newContent) contentResults.push(newContent);
    }

    console.log(`Successfully cloned master template: ${contentResults.length} content items, ${(upsertedCats || []).length} categories, ${pillarResults.length} pillars`);

    // Mark seeding as complete
    await supabaseClient
      .from('agent_sites')
      .update({ seed_status: 'complete', seeded_at: new Date().toISOString() })
      .eq('id', agentSiteId);

    return new Response(
      JSON.stringify({
        success: true,
        created: {
          content_items: contentResults.length,
          categories: (upsertedCats || []).length,
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