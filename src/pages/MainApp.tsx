import { useState } from "react";
import { Settings, Menu, Share2, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MediaPlayer } from "@/components/MediaPlayer";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ChatInterface } from "@/components/ChatInterface";
import heroImage from "@/assets/hero-image.jpg";
import content1 from "@/assets/content-1.jpg";
import content2 from "@/assets/content-2.jpg";
import content3 from "@/assets/content-3.jpg";

const sampleMediaItems = [
  {
    id: "1",
    title: "THE GENESIS BLOCK",
    price: "$25",
    rarity: "Limited",
    imageUrl: heroImage,
    type: "article" as const,
    category: "Episode",
    description: "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating."
  },
  {
    id: "2", 
    title: "Digital Genesis Protocol",
    price: "$25",
    rarity: "Limited",
    imageUrl: content1,
    type: "video" as const,
    category: "Episode",
    description: "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating."
  },
  {
    id: "3", 
    title: "Cosmic Nexus Archives",
    price: "$18",
    rarity: "Rare",
    imageUrl: content2,
    type: "article" as const,
    category: "Guide",
    description: "Explore the mysteries of the cosmic nexus and unlock ancient secrets hidden in the digital archives."
  },
  {
    id: "4",
    title: "MetaKnight Chronicles",
    price: "$30",
    rarity: "Epic",
    imageUrl: content3,
    type: "video" as const,
    category: "Series",
    description: "Follow the legendary MetaKnight on an epic journey through the digital realms of Terra."
  },
  {
    id: "5",
    title: "Blockchain Fundamentals",
    imageUrl: content1,
    type: "article" as const,
    category: "Education",
    description: "Master the foundational concepts of blockchain technology and decentralized systems."
  },
  {
    id: "6",
    title: "DeFi Deep Dive",
    imageUrl: content2,
    type: "video" as const,
    category: "Tutorial",
    description: "Comprehensive guide to decentralized finance protocols and yield farming strategies."
  },
  {
    id: "7",
    title: "Quantum Mining Expedition",
    price: "$45",
    rarity: "Legendary",
    imageUrl: content3,
    type: "video" as const,
    category: "Episode",
    description: "Join the most dangerous mining expedition into the quantum depths of Terra's digital underground."
  },
  {
    id: "8",
    title: "Crypto Trading Mastery",
    price: "$22",
    rarity: "Rare",
    imageUrl: content1,
    type: "article" as const,
    category: "Guide",
    description: "Advanced trading strategies for navigating volatile cryptocurrency markets with confidence."
  },
  {
    id: "9",
    title: "The Shadow Protocol",
    price: "$35",
    rarity: "Epic",
    imageUrl: content2,
    type: "video" as const,
    category: "Series",
    description: "Uncover the mysterious Shadow Protocol that threatens to reshape the digital landscape forever."
  },
  {
    id: "10",
    title: "Smart Contract Security",
    imageUrl: content3,
    type: "article" as const,
    category: "Education",
    description: "Essential security practices for developing and auditing smart contracts on various blockchain platforms."
  },
  {
    id: "11",
    title: "NFT Creation Workshop",
    imageUrl: content1,
    type: "video" as const,
    category: "Tutorial",
    description: "Step-by-step guide to creating, minting, and marketing your own NFT collections."
  },
  {
    id: "12",
    title: "Digital Rebellion",
    price: "$28",
    rarity: "Limited",
    imageUrl: content2,
    type: "video" as const,
    category: "Episode",
    description: "The resistance begins as digital citizens fight back against the oppressive Data Lords."
  },
  {
    id: "13",
    title: "DAO Governance Guide",
    imageUrl: content3,
    type: "article" as const,
    category: "Education",
    description: "Understanding decentralized autonomous organizations and participating in community governance."
  }
];

export default function MainApp() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'discovery' | 'fullscreen'>('discovery');
  const [selectedContent, setSelectedContent] = useState(sampleMediaItems[0]);
  const [isContentPlaying, setIsContentPlaying] = useState(false);

  const handleContentSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real app, this would filter content based on the search query
  };

  const handleContentSelect = (item: any) => {
    setSelectedContent(item);
    // Scroll to top to show the selected content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartPlaying = () => {
    setIsContentPlaying(true);
  };

  const handleStopPlaying = () => {
    setIsContentPlaying(false);
  };

  return (
    <div className="min-h-screen cosmic-bg relative">
      {/* Floating Left Navigation */}
      <div className={`fixed left-4 top-4 z-50 flex flex-col gap-3 transition-all duration-300 ${
        isContentPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="glass hover-glow w-10 h-10 rounded-lg"
          onClick={() => setViewMode(viewMode === 'discovery' ? 'fullscreen' : 'discovery')}
        >
          {viewMode === 'discovery' ? (
            <Maximize className="h-4 w-4" />
          ) : (
            <Minimize className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hero Section - Responsive Height */}
      <section className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-500 ${
        viewMode === 'discovery' ? 'h-[65vh]' : 'h-screen'
      }`}>
        <MediaPlayer
          title={selectedContent.title}
          episode={selectedContent.category === "Episode" ? `Episode ${selectedContent.id}.0` : selectedContent.category}
          description={selectedContent.description}
          imageUrl={selectedContent.imageUrl}
          viewMode={viewMode}
          isContentPlaying={isContentPlaying}
          onStartPlaying={handleStartPlaying}
          onStopPlaying={handleStopPlaying}
        />
      </section>

      {/* Discovery Content - Visible only in discovery mode */}
      {viewMode === 'discovery' && (
        <div className={`relative transition-all duration-500 ${
          isContentPlaying ? 'z-5' : 'z-20'
        }`} style={{ marginTop: '65vh' }}>
          <div className="min-h-screen cosmic-bg/95 backdrop-blur-sm">
            <main className={`pb-24 ${isChatExpanded ? 'pb-[60vh]' : 'pb-24'} transition-all duration-300`}>
              {/* Content Sections */}
              <section className="space-y-12 px-4 pt-8">
                {/* Media Carousels */}
                <MediaCarousel
                  title="KnytBooks"
                  items={sampleMediaItems.filter(item => item.type === 'article')}
                  onItemClick={handleContentSelect}
                  showOwnedToggle={true}
                />

                <MediaCarousel
                  title="Learn to Earn"
                  items={sampleMediaItems.filter(item => item.category === 'Education' || item.category === 'Tutorial')}
                  onItemClick={handleContentSelect}
                />

                <MediaCarousel
                  title="Featured Content"
                  items={sampleMediaItems}
                  onItemClick={handleContentSelect}
                />
              </section>
            </main>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className={`transition-all duration-300 ${
        isContentPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <ChatInterface
          isExpanded={isChatExpanded}
          onToggle={() => setIsChatExpanded(!isChatExpanded)}
          onTextSearch={handleContentSearch}
          onVoiceSearch={handleContentSearch}
        />
      </div>

    </div>
  );
}