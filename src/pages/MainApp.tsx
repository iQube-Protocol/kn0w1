import { useState } from "react";
import { Settings, Menu, Share2 } from "lucide-react";
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
    title: "Digital Genesis Protocol",
    price: "$25",
    rarity: "Limited",
    imageUrl: content1,
    type: "video" as const,
    category: "Episode",
  },
  {
    id: "2", 
    title: "Cosmic Nexus Archives",
    price: "$18",
    rarity: "Rare",
    imageUrl: content2,
    type: "article" as const,
    category: "Guide",
  },
  {
    id: "3",
    title: "MetaKnight Chronicles",
    price: "$30",
    rarity: "Epic",
    imageUrl: content3,
    type: "video" as const,
    category: "Series",
  },
  {
    id: "4",
    title: "Blockchain Fundamentals",
    imageUrl: content1,
    type: "article" as const,
    category: "Education",
  },
  {
    id: "5",
    title: "DeFi Deep Dive",
    imageUrl: content2,
    type: "video" as const,
    category: "Tutorial",
  },
];

export default function MainApp() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'discovery' | 'fullscreen'>('discovery');
  const [selectedContent, setSelectedContent] = useState(sampleMediaItems[0]);

  const handleContentSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real app, this would filter content based on the search query
  };

  const handleContentSelect = (item: any) => {
    setSelectedContent(item);
    // Scroll to top to show the selected content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen cosmic-bg relative">
      {/* Floating Left Navigation */}
      <div className="fixed left-4 top-4 z-50 flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="glass hover-glow w-10 h-10 rounded-lg">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero Section - Responsive Height */}
      <section className={`fixed top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-500 ${
        viewMode === 'discovery' ? 'h-[65vh]' : 'h-screen'
      }`}>
        <MediaPlayer
          title="THE GENESIS BLOCK"
          episode="Episode 1.0"
          description="A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating."
          imageUrl={heroImage}
          viewMode={viewMode}
          onToggleView={() => setViewMode(viewMode === 'discovery' ? 'fullscreen' : 'discovery')}
        />
      </section>

      {/* Discovery Content - Visible only in discovery mode */}
      {viewMode === 'discovery' && (
        <div className="relative z-20 transition-all duration-500" style={{ marginTop: '65vh' }}>
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
      <ChatInterface
        isExpanded={isChatExpanded}
        onToggle={() => setIsChatExpanded(!isChatExpanded)}
        onTextSearch={handleContentSearch}
        onVoiceSearch={handleContentSearch}
      />

    </div>
  );
}