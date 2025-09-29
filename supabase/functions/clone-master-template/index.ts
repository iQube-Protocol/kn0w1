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

    // Master template content - Rich multimedia experiences
    const masterContent = [
      {
        title: "THE GENESIS BLOCK: Digital Awakening",
        description: "A revolutionary digital realm lies beyond the physical world of Terra. Discover the epic battle between The Fang and The Bat clans as ancient prophecies unfold in this immersive multimedia experience featuring stunning visuals and interactive storytelling.",
        slug: "the-genesis-block",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        l2e_points: 50,
        featured: true,
        pinned: true,
        tags: ["Genesis", "Story", "Featured", "Interactive"],
        social_source: "YouTube",
        social_url: "https://youtube.com/watch?v=genesis-block",
        social_embed_html: `<div class="aspect-video bg-gradient-to-br from-purple-900 to-indigo-800 rounded-lg flex items-center justify-center"><img src="/src/assets/content-1.jpg" alt="Genesis Block" class="w-full h-full object-cover rounded-lg" /></div>`
      },
      {
        title: "Digital Genesis Protocol: The Awakening",
        description: "Witness the birth of the digital realm in this cinematic masterpiece. Follow the creation of Terra's first digital consciousness and the epic battles that shaped two worlds. Features stunning 4K visuals and immersive soundscapes.",
        slug: "digital-genesis-protocol",
        type: "video",
        strand: "learn_to_earn", 
        status: "published",
        l2e_points: 75,
        featured: true,
        tags: ["Video", "Protocol", "Digital", "Cinematic"],
        social_source: "Vimeo",
        social_url: "https://vimeo.com/genesis-protocol",
        social_embed_html: `<div class="aspect-video bg-gradient-to-r from-blue-900 to-purple-800 rounded-lg overflow-hidden"><img src="/src/assets/content-2.jpg" alt="Digital Genesis Protocol" class="w-full h-full object-cover" /></div>`
      },
      {
        title: "Cosmic Nexus Archives: Ancient Secrets",
        description: "Explore the mysteries of the cosmic nexus through interactive 3D environments. Unlock ancient secrets hidden in digital archives using cutting-edge AR technology. Includes downloadable artifacts and exclusive behind-the-scenes content.",
        slug: "cosmic-nexus-archives",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published", 
        l2e_points: 40,
        tags: ["Archive", "Guide", "Cosmic", "Interactive", "AR"],
        social_source: "Instagram",
        social_url: "https://instagram.com/p/cosmic-nexus",
        social_embed_html: `<div class="grid grid-cols-2 gap-2 rounded-lg overflow-hidden"><img src="/src/assets/content-3.jpg" alt="Cosmic Archives" class="w-full h-32 object-cover" /><img src="/src/assets/hero-image.jpg" alt="Nexus Portal" class="w-full h-32 object-cover" /></div>`
      },
      {
        title: "MetaKnight Chronicles: Episode 1 - The Calling",
        description: "Follow the legendary MetaKnight on an epic journey through Terra's digital realms. This premiere episode features motion-capture performances, original orchestral score, and branching storylines based on viewer choices.",
        slug: "metaknight-chronicles-ep1",
        type: "video",
        strand: "civic_readiness",
        status: "published",
        l2e_points: 60,
        featured: true,
        pinned: true,
        tags: ["Chronicle", "Series", "Epic", "Interactive"],
        l2e_quiz_url: "https://quiz.metaknyt.com/metaknight-ep1",
        l2e_cta_label: "Take the Hero's Quiz",
        l2e_cta_url: "https://metaknyt.com/hero-path"
      },
      {
        title: "Blockchain Fundamentals: Complete Masterclass",
        description: "Master blockchain technology through hands-on labs, real-world case studies, and expert interviews. Includes certificate upon completion, exclusive Discord access, and monthly Q&A sessions with industry leaders.",
        slug: "blockchain-fundamentals-masterclass", 
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        l2e_points: 100,
        tags: ["Blockchain", "Education", "Fundamentals", "Certificate", "Masterclass"],
        l2e_quiz_url: "https://learn.metaknyt.com/blockchain-quiz",
        l2e_cta_label: "Start Learning Path",
        l2e_cta_url: "https://metaknyt.com/blockchain-path"
      },
      {
        title: "DeFi Deep Dive: Yield Farming Strategies 2024",
        description: "Comprehensive video series covering advanced DeFi protocols, risk management, and yield optimization. Includes live trading demos, portfolio tracking tools, and weekly market analysis updates.",
        slug: "defi-deep-dive-2024",
        type: "video",
        strand: "learn_to_earn",
        status: "published",
        l2e_points: 85,
        featured: true,
        tags: ["DeFi", "Tutorial", "Finance", "Trading", "2024"],
        social_source: "Twitter",
        social_url: "https://twitter.com/metaknyt/status/defi-strategies",
        social_embed_html: `<blockquote class="twitter-tweet p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"><p>🚀 New DeFi masterclass dropping! Advanced yield farming strategies that actually work in 2024 📊</p></blockquote>`
      },
      {
        title: "Quantum Mining Expedition: Into the Void", 
        description: "Experience the most dangerous mining expedition through Terra's quantum underground. VR-compatible content with haptic feedback support. Collect rare digital artifacts and compete in global leaderboards.",
        slug: "quantum-mining-expedition-vr",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        l2e_points: 120,
        featured: true,
        tags: ["Mining", "Quantum", "Adventure", "VR", "Gaming"],
        social_source: "TikTok",
        social_url: "https://tiktok.com/@metaknyt/quantum-mining",
        social_embed_html: `<div class="aspect-square bg-black rounded-lg flex items-center justify-center text-white font-bold">🎮 VR Experience Available</div>`
      },
      {
        title: "Crypto Trading Mastery: Technical Analysis Pro",
        description: "Master advanced technical analysis with AI-powered trading signals. Includes backtesting tools, risk calculators, and real-time market sentiment analysis. Features collaboration with top crypto analysts.",
        slug: "crypto-trading-mastery-pro",
        type: "mixed", 
        strand: "learn_to_earn",
        status: "published",
        l2e_points: 90,
        tags: ["Trading", "Crypto", "Strategy", "AI", "Analytics"],
        l2e_quiz_url: "https://trading.metaknyt.com/assessment",
        l2e_cta_label: "Access Trading Tools",
        l2e_cta_url: "https://metaknyt.com/trading-suite"
      },
      {
        title: "The Shadow Protocol: Digital Conspiracy Unveiled",
        description: "Uncover the truth behind the Shadow Protocol in this interactive documentary. Features real blockchain forensics, encrypted messages from whistleblowers, and exclusive interviews with cybersecurity experts.",
        slug: "shadow-protocol-documentary",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        l2e_points: 95,
        featured: true,
        tags: ["Protocol", "Mystery", "Shadow", "Documentary", "Investigation"],
        social_source: "LinkedIn",
        social_url: "https://linkedin.com/posts/metaknyt-shadow-protocol",
        social_embed_html: `<div class="p-4 bg-blue-50 rounded-lg border"><h4 class="font-semibold">🕵️ INVESTIGATION ALERT</h4><p class="text-sm mt-1">New evidence uncovered in the Shadow Protocol case. Blockchain forensics reveal shocking connections...</p></div>`
      },
      {
        title: "Smart Contract Security Bootcamp", 
        description: "Intensive security training featuring live hacking demonstrations, code review sessions, and bug bounty preparation. Led by top auditors from major security firms with $50M+ in findings.",
        slug: "smart-contract-security-bootcamp",
        type: "mixed",
        strand: "learn_to_earn", 
        status: "published",
        l2e_points: 150,
        tags: ["Security", "Smart Contracts", "Development", "Hacking", "Bootcamp"],
        l2e_quiz_url: "https://security.metaknyt.com/bootcamp-exam",
        l2e_cta_label: "Join Security Guild",
        l2e_cta_url: "https://metaknyt.com/security-guild"
      },
      {
        title: "NFT Creation Workshop: From Concept to Marketplace",
        description: "Complete NFT creation pipeline including art generation with AI, smart contract deployment, marketing strategies, and community building. Features partnerships with major NFT platforms.",
        slug: "nft-creation-workshop-complete",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published", 
        l2e_points: 110,
        tags: ["NFT", "Workshop", "Creation", "AI", "Marketing"],
        social_source: "Discord",
        social_url: "https://discord.gg/metaknyt-nft",
        social_embed_html: `<div class="p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500"><p class="text-sm"><strong>💎 NFT Workshop Live!</strong><br/>Join 2,500+ creators in our exclusive Discord</p></div>`
      },
      {
        title: "Digital Rebellion: The Resistance Begins",
        description: "Interactive storyline where your choices shape the rebellion's future. Features multiple endings, character progression systems, and collaborative storytelling with the community. Now with multiplayer mode!",
        slug: "digital-rebellion-interactive",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        l2e_points: 80, 
        tags: ["Rebellion", "Story", "Resistance", "Interactive", "Multiplayer"],
        social_source: "YouTube",
        social_url: "https://youtube.com/watch?v=digital-rebellion",
        social_embed_html: `<div class="aspect-video bg-gradient-to-r from-red-800 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">⚡ REVOLUTION STARTS NOW ⚡</div>`
      },
      {
        title: "DAO Governance Masterclass: Decentralized Democracy",
        description: "Comprehensive guide to DAO structures, voting mechanisms, and governance token economics. Includes case studies from successful DAOs and templates for launching your own organization.",
        slug: "dao-governance-masterclass",
        type: "mixed",
        strand: "learn_to_earn",
        status: "published",
        l2e_points: 70,
        tags: ["DAO", "Governance", "Community", "Democracy", "Templates"],
        l2e_quiz_url: "https://governance.metaknyt.com/dao-quiz",
        l2e_cta_label: "Launch Your DAO",
        l2e_cta_url: "https://metaknyt.com/dao-builder"
      },
      {
        title: "Web3 Social Impact: Building Better Communities",
        description: "Explore how blockchain technology can solve real-world problems. Features case studies on climate action, financial inclusion, and digital identity. Includes funding opportunities for impact projects.",
        slug: "web3-social-impact",
        type: "mixed",
        strand: "civic_readiness",
        status: "published",
        l2e_points: 65,
        tags: ["Social Impact", "Community", "Climate", "Identity", "Funding"],
        social_source: "Medium",
        social_url: "https://medium.com/@metaknyt/web3-social-impact",
        social_embed_html: `<div class="p-4 bg-green-50 rounded-lg border border-green-200"><h4 class="text-green-800 font-semibold">🌱 Impact Story</h4><p class="text-green-700 text-sm mt-1">How one DAO is fighting climate change through blockchain innovation</p></div>`
      }
    ];

    // Create default categories first
    const categories = [
      { name: "Epic Stories", slug: "epic-stories", strand: "civic_readiness", description: "Immersive narrative experiences and interactive storylines" },
      { name: "Documentary", slug: "documentary", strand: "civic_readiness", description: "Investigative content and real-world explorations" },
      { name: "Masterclass", slug: "masterclass", strand: "learn_to_earn", description: "Comprehensive learning experiences with certification" },
      { name: "Workshop", slug: "workshop", strand: "learn_to_earn", description: "Hands-on learning and skill-building sessions" },
      { name: "Bootcamp", slug: "bootcamp", strand: "learn_to_earn", description: "Intensive training programs for advanced skills" },
      { name: "Impact Projects", slug: "impact-projects", strand: "civic_readiness", description: "Social impact and community-driven initiatives" }
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
        display_name: "Civic Readiness Initiative",
        short_summary: "Empowering digital citizenship through immersive storytelling and real-world impact",
        long_context_md: `## Civic Readiness: Building Tomorrow's Digital Citizens

The Civic Readiness pillar combines immersive storytelling with practical civic engagement, creating experiences that prepare users for active participation in digital democracies and decentralized communities.

### Core Focus Areas:
- **Interactive Narratives**: Epic storylines that teach governance, ethics, and community building
- **Real-World Impact**: Projects that bridge digital skills with tangible social change
- **Democratic Participation**: Training in DAO governance, consensus building, and collective decision-making
- **Digital Rights**: Education on privacy, security, and digital sovereignty

### Learning Outcomes:
- Understanding of decentralized governance models
- Skills in community organizing and consensus building  
- Knowledge of digital rights and responsibilities
- Ability to create positive social impact through technology`,
        goals_json: [
          "Develop informed digital citizens",
          "Bridge virtual and physical community engagement", 
          "Foster ethical leadership in Web3 spaces",
          "Create measurable social impact through blockchain technology"
        ],
        kpis_json: [
          "Community governance participation rates",
          "Social impact project completions", 
          "Digital citizenship assessment scores",
          "Cross-platform engagement metrics"
        ]
      },
      {
        display_name: "Learn to Earn Academy",
        short_summary: "Advanced skill development with tokenized incentives and career pathways",
        long_context_md: `## Learn to Earn: The Future of Professional Development

Our Learn to Earn Academy revolutionizes skill acquisition by combining cutting-edge educational content with blockchain-based incentive systems, creating clear pathways from learning to earning.

### Program Structure:
- **Skill Trees**: Gamified learning paths with branching specializations
- **Mentorship Network**: 1:1 connections with industry experts and successful alumni
- **Project Portfolios**: Real-world assignments that build demonstrable expertise
- **Certification Pipeline**: Industry-recognized credentials with blockchain verification

### Available Tracks:
- **DeFi Specialist**: Advanced protocol analysis and yield optimization
- **Security Auditor**: Smart contract security and vulnerability assessment
- **Community Builder**: DAO governance and community growth strategies
- **Creator Economy**: NFT development and digital asset monetization

### Earning Mechanisms:
- Completion rewards for courses and assessments
- Bonus tokens for exceptional project work
- Referral incentives for bringing new learners
- Grant opportunities for impact-driven final projects`,
        goals_json: [
          "Accelerate Web3 skill development",
          "Create clear learning-to-earning pathways",
          "Build industry-ready professionals",
          "Foster innovation through project-based learning"
        ],
        kpis_json: [
          "Course completion and retention rates",
          "Job placement success within 6 months",
          "Average earning increase post-certification",
          "Industry partnership and hiring metrics"
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
      .select('owner_user_id')
      .eq('id', agentSiteId)
      .single();

    if (!agentSite) {
      throw new Error('Agent site not found');
    }

    // Create content items  
    const contentResults: { id: string; title: string }[] = [];
    for (const content of masterContent) {
      // Map content to appropriate category based on content type and strand
      let categorySlug = 'masterclass'; // default
      if (content.type === 'mixed' && content.strand === 'civic_readiness') {
        categorySlug = content.tags.includes('Documentary') ? 'documentary' : 'epic-stories';
      } else if (content.strand === 'learn_to_earn') {
        if (content.tags.includes('Bootcamp')) categorySlug = 'bootcamp';
        else if (content.tags.includes('Workshop')) categorySlug = 'workshop';
        else categorySlug = 'masterclass';
      } else if (content.strand === 'civic_readiness') {
        categorySlug = content.tags.includes('Impact') ? 'impact-projects' : 'epic-stories';
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