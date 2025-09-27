import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Crown, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  title: string;
  price?: string;
  rarity?: string;
  imageUrl?: string;
  type: 'video' | 'audio' | 'article';
  category: string;
}

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  showOwnedToggle?: boolean;
}

export function MediaCarousel({ title, items, onItemClick, showOwnedToggle = false }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const scrollRight = () => {
    setCurrentIndex(Math.min(items.length - 3, currentIndex + 1));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-3 items-center">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Play className="h-5 w-5 text-neon-magenta" />
          {title}
        </h2>
        <div className="flex justify-center">
          {showOwnedToggle && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Owned</span>
              <Switch />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className="glass hover-glow"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollRight}
              disabled={currentIndex >= items.length - 3}
              className="glass hover-glow"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-4 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
        >
          {items.map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaCard({ item, onClick }: { item: MediaItem; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={cn(
        "flex-shrink-0 w-[calc(33.333%-0.75rem)] aspect-[3/4] relative overflow-hidden cursor-pointer",
        "glass-card hover-float transition-all duration-300",
        isHovered && "scale-105"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cosmic-gradient">
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4">
        {/* Top Badge */}
        {item.rarity && (
          <div className="self-start glass rounded-lg px-2 py-1 flex items-center gap-1">
            <Crown className="h-3 w-3 text-neon-orange" />
            <span className="text-xs text-neon-orange font-medium">{item.rarity}</span>
          </div>
        )}

        {/* Play Button Overlay */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/30 backdrop-blur-md border border-primary/50 flex items-center justify-center animate-fade-in">
              <Play className="h-5 w-5 text-primary ml-0.5" />
            </div>
          </div>
        )}

        {/* Bottom Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
            {item.title}
          </h3>
          {item.price && (
            <div className="flex items-center justify-between">
              <span className="text-neon-cyan text-sm font-medium">From {item.price}</span>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}