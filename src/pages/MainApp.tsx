import { useState, useEffect } from "react";
import { Settings, Menu, Share2, Maximize, Minimize, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import { MediaCarousel } from "@/components/MediaCarousel";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSelectedSiteId } from "@/hooks/useSelectedSiteId";
import { useToast } from "@/hooks/use-toast";

import heroImage from "@/assets/hero-image.jpg";

interface MediaItem {
  id: string;
  title: string;
  price?: string;
  rarity?: string;
  imageUrl?: string;
  type: 'video' | 'audio' | 'article';
  category: string;
  description: string;
}

export default function MainApp() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'discovery' | 'fullscreen'>('discovery');
  const [selectedContent, setSelectedContent] = useState<MediaItem | null>(null);
  const [isContentPlaying, setIsContentPlaying] = useState(false);
  const [contentItems, setContentItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const selectedSiteId = useSelectedSiteId();
  const { toast } = useToast();
  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedSiteId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('content_items')
          .select(`
            *,
            content_categories (
              name,
              slug
            ),
            media_assets (
              storage_path,
              external_url,
              mime_type
            )
          `)
          .eq('agent_site_id', selectedSiteId)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database content to MediaItem format
        const transformedContent: MediaItem[] = (data || []).map((item: any) => {
          // Get first media asset for thumbnail
          const thumbnail = item.media_assets?.[0];
          const imageUrl = thumbnail?.external_url || 
                          (thumbnail?.storage_path ? 
                            `https://ysykvckvggaqykhhntyo.supabase.co/storage/v1/object/public/content-files/${thumbnail.storage_path}` 
                            : heroImage);

          return {
            id: item.id,
            title: item.title,
            imageUrl,
            type: item.type as 'video' | 'audio' | 'article',
            category: item.content_categories?.name || 'Uncategorized',
            description: item.description || '',
            price: item.featured ? '$25' : undefined,
            rarity: item.pinned ? 'Featured' : item.featured ? 'Limited' : undefined,
          };
        });

        setContentItems(transformedContent);
        
        // Set initial selected content to first item
        if (transformedContent.length > 0 && !selectedContent) {
          setSelectedContent(transformedContent[0]);
        }
      } catch (error: any) {
        console.error('Error fetching content:', error);
        toast({
          title: "Error loading content",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedSiteId]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleContentSearch = (query: string) => {
    console.log("Searching for:", query);
    // In a real app, this would filter content based on the search query
  };

  const handleContentSelect = (item: MediaItem) => {
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-foreground">Loading content...</div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!selectedContent || contentItems.length === 0) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No published content available</h2>
          <p className="text-muted-foreground">Check back later or contact the administrator.</p>
          {isAdmin && (
            <Button onClick={() => navigate('/admin')}>
              Go to Admin Panel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg relative">
      {/* Floating Left Navigation */}
      <div className={`fixed left-4 top-4 z-50 flex flex-col gap-3 transition-all duration-300 ${
        isContentPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="glass hover-glow w-10 h-10 rounded-lg"
          onClick={() => navigate('/')}
          title="Back to Home"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        {/* Admin Access Button - Only show for admins */}
        {isAdmin && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="glass hover-glow w-10 h-10 rounded-lg border border-primary/30"
            onClick={() => navigate('/admin')}
            title="Admin Panel"
          >
            <Shield className="h-4 w-4 text-primary" />
          </Button>
        )}
        
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
        
        {/* Sign Out Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="glass hover-glow w-10 h-10 rounded-lg border border-red-500/30"
          onClick={handleSignOut}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 text-red-400" />
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
                {/* Featured/Pinned Content */}
                {contentItems.filter(item => item.rarity).length > 0 && (
                  <MediaCarousel
                    title="Featured Content"
                    items={contentItems.filter(item => item.rarity)}
                    onItemClick={handleContentSelect}
                  />
                )}

                {/* Articles/KnytBooks */}
                {contentItems.filter(item => item.type === 'article').length > 0 && (
                  <MediaCarousel
                    title="KnytBooks"
                    items={contentItems.filter(item => item.type === 'article')}
                    onItemClick={handleContentSelect}
                    showOwnedToggle={true}
                  />
                )}

                {/* Videos */}
                {contentItems.filter(item => item.type === 'video').length > 0 && (
                  <MediaCarousel
                    title="Video Content"
                    items={contentItems.filter(item => item.type === 'video')}
                    onItemClick={handleContentSelect}
                  />
                )}

                {/* All Content */}
                <MediaCarousel
                  title="All Content"
                  items={contentItems}
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