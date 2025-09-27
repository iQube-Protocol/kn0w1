import { useState } from "react";
import { Play, Pause, Maximize, Minimize, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MediaPlayerProps {
  title: string;
  episode?: string;
  description?: string;
  imageUrl?: string;
  isPlaying?: boolean;
  viewMode?: 'discovery' | 'fullscreen';
  onPlay?: () => void;
  onToggleView?: () => void;
}

export function MediaPlayer({
  title,
  episode = "Episode 1.0",
  description = "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery.",
  imageUrl,
  isPlaying = false,
  viewMode = 'discovery',
  onPlay,
  onToggleView,
}: MediaPlayerProps) {
  const [playing, setPlaying] = useState(isPlaying);

  const handlePlay = () => {
    setPlaying(!playing);
    onPlay?.();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cosmic-gradient"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top Controls */}
        <div className="flex justify-between items-start">
          {/* Episode Badge */}
          <div className="glass rounded-lg px-3 py-1">
            <span className="text-sm text-neon-cyan font-medium">{episode}</span>
            <span className="text-xs text-muted-foreground ml-2">#1,212 Limited</span>
          </div>
          
          {/* View Toggle Button */}
          <Button
            onClick={onToggleView}
            variant="ghost"
            size="sm"
            className="glass hover-glow w-10 h-10 rounded-lg"
          >
            {viewMode === 'discovery' ? (
              <Maximize className="h-4 w-4" />
            ) : (
              <Minimize className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Center Play Button */}
        <div className="flex justify-center">
          <Button
            onClick={handlePlay}
            className="w-20 h-20 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/50 hover-glow backdrop-blur-md"
          >
            {playing ? (
              <Pause className="h-8 w-8 text-primary" />
            ) : (
              <Play className="h-8 w-8 text-primary ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Content */}
        <div className="space-y-4 mb-8">
          <div>
            <h1 className={`font-bold text-foreground mb-2 neon-text ${
              viewMode === 'discovery' ? 'text-2xl lg:text-3xl' : 'text-4xl'
            }`}>
              {title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {description}
            </p>
          </div>
          
          {/* Action Buttons - Only visible in discovery mode */}
          {viewMode === 'discovery' && (
            <div className="flex gap-2 justify-center mt-6">
              <Button variant="outline" size="sm" className="glass hover-glow text-xs px-2 py-1 h-7">
                <BookOpen className="h-3 w-3 mr-1" />
                Read
              </Button>
              <Button variant="outline" size="sm" className="glass hover-glow text-xs px-2 py-1 h-7">
                <Play className="h-3 w-3 mr-1" />
                Watch
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="glass hover-glow h-7 w-7 p-0"
              >
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}