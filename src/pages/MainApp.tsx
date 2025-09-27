import { useState } from "react";
import { Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        <Button variant="ghost" size="sm" className="glass hover-glow w-12 h-12 rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="glass hover-glow w-12 h-12 rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Fixed Hero Section */}
      <section className="fixed top-0 left-0 right-0 h-screen z-10 p-4 flex items-center justify-center">
        <MediaPlayer
          title="THE GENESIS BLOCK"
          episode="Episode 1.0"
          description="A digital realm lies beyond the physical world of Terra that you know, awaiting discovery. The war between The Fang and The Bat clans is escalating."
          imageUrl={heroImage}
          onFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      </section>

      {/* Scrollable Content Overlay */}
      <div className="relative z-20" style={{ marginTop: '100vh' }}>
        <div className="min-h-screen cosmic-bg/95 backdrop-blur-sm">
          <main className={`pb-24 ${isChatExpanded ? 'pb-[60vh]' : 'pb-24'} transition-all duration-300`}>
            {/* Content Sections */}
            <section className="space-y-8 px-4 pt-8">
              {/* Season Filter */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Season</span>
                  <Button variant="ghost" size="sm" className="glass hover-glow">
                    All ▼
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View</span>
                  <Button variant="ghost" size="sm" className="glass hover-glow">
                    All ▼
                  </Button>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Owned</span>
                  <div className="w-8 h-4 bg-muted/30 rounded-full relative">
                    <div className="w-3 h-3 bg-primary rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>

              {/* Media Carousels */}
              <MediaCarousel
                title="KnytBooks"
                items={sampleMediaItems.filter(item => item.type === 'article')}
                onItemClick={handleContentSelect}
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

      {/* Chat Interface */}
      <ChatInterface
        isExpanded={isChatExpanded}
        onToggle={() => setIsChatExpanded(!isChatExpanded)}
        onTextSearch={handleContentSearch}
        onVoiceSearch={handleContentSearch}
      />

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background cosmic-bg">
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
              <MediaPlayer
                title="THE GENESIS BLOCK"
                episode="Episode 1.0"
                description="A digital realm lies beyond the physical world of Terra that you know, awaiting discovery."
                imageUrl={heroImage}
                onFullscreen={() => setIsFullscreen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}