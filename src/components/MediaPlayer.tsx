import { useState } from "react";
import { Play, Pause, Maximize, Share2, BookOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MediaPlayerProps {
  title: string;
  episode?: string;
  description?: string;
  imageUrl?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onFullscreen?: () => void;
}

export function MediaPlayer({
  title,
  episode = "Episode 1.0",
  description = "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery.",
  imageUrl,
  isPlaying = false,
  onPlay,
  onFullscreen,
}: MediaPlayerProps) {
  const [playing, setPlaying] = useState(isPlaying);

  const handlePlay = () => {
    setPlaying(!playing);
    onPlay?.();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
        {/* Episode Badge - Right Side */}
        <div className="flex justify-end items-start">
          <div className="glass rounded-lg px-3 py-1">
            <span className="text-sm text-neon-cyan font-medium">{episode}</span>
            <span className="text-xs text-muted-foreground ml-2">#1,212 Limited</span>
          </div>
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
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 neon-text">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="glass hover-glow">
              <BookOpen className="h-4 w-4 mr-2" />
              Read
            </Button>
            <Button variant="outline" className="glass hover-glow">
              <Play className="h-4 w-4 mr-2" />
              Watch
            </Button>
            <Button
              onClick={onFullscreen}
              variant="ghost" 
              size="sm" 
              className="glass hover-glow"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-primary glow"></div>
              <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-primary to-accent"></div>
              </div>
              <div className="w-4 h-4 rounded-full bg-primary/50"></div>
              <div className="w-4 h-4 rounded-full bg-muted/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}