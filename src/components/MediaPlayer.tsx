import { useState } from "react";
import { Play, Pause, Maximize, Minimize, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PDFViewer } from "./PDFViewer";

interface MediaPlayerProps {
  title: string;
  episode?: string;
  description?: string;
  imageUrl?: string;
  isPlaying?: boolean;
  viewMode?: 'discovery' | 'fullscreen';
  isContentPlaying?: boolean;
  contentType?: string;
  contentUrl?: string;
  onPlay?: () => void;
  onStartPlaying?: () => void;
  onStopPlaying?: () => void;
}

export function MediaPlayer({
  title,
  episode = "Episode 1.0",
  description = "A digital realm lies beyond the physical world of Terra that you know, awaiting discovery.",
  imageUrl,
  isPlaying = false,
  viewMode = 'discovery',
  isContentPlaying = false,
  contentType,
  contentUrl,
  onPlay,
  onStartPlaying,
  onStopPlaying,
}: MediaPlayerProps) {
  const [playing, setPlaying] = useState(isPlaying);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  const handlePlay = () => {
    setPlaying(!playing);
    onPlay?.();
  };

  const handlePageClick = () => {
    if (isContentPlaying && onStopPlaying) {
      onStopPlaying();
    }
  };

  const handleContentAction = (action: 'read' | 'watch') => {
    console.log(`Starting ${action} for:`, title);
    if (contentType === 'pdf' && contentUrl) {
      setShowPDFViewer(true);
    }
    onStartPlaying?.();
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden cursor-pointer"
      onClick={handlePageClick}
    >
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
        <div className="flex justify-end items-start">
          {/* Episode Badge */}
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
        <div className="space-y-4 mb-8">
          <div>
            <h1 className={`font-bold text-foreground mb-2 neon-text ${
              viewMode === 'discovery' ? 'text-2xl lg:text-3xl' : 'text-2xl lg:text-3xl'
            }`}>
              {title}
            </h1>
            {(viewMode !== 'discovery' || !isContentPlaying) && viewMode === 'discovery' && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                {description}
              </p>
            )}
          </div>
          
          {/* Action Buttons - Show in both modes when not playing */}
          {!isContentPlaying && (
            <div className="flex gap-2 mt-6">
              {contentType === 'pdf' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass hover-glow text-xs px-2 py-1 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContentAction('read');
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Read PDF
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="glass hover-glow text-xs px-2 py-1 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContentAction('read');
                    }}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="glass hover-glow text-xs px-2 py-1 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContentAction('watch');
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && contentUrl && (
        <PDFViewer 
          url={contentUrl} 
          onClose={() => {
            setShowPDFViewer(false);
            onStopPlaying?.();
          }} 
        />
      )}
    </div>
  );
}