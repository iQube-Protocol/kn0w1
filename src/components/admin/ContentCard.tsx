import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  FileText,
  Image as ImageIcon,
  Music,
  Share2,
  MoreHorizontal,
  Edit,
  Eye,
  Star,
  Pin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MediaAsset {
  id: string;
  kind: string;
  storage_path?: string;
  external_url?: string;
  oembed_html?: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  strand: string;
  status: string;
  type: string;
  featured: boolean;
  pinned: boolean;
  views_count: number;
  created_at: string;
  publish_at: string | null;
  category: { name: string } | null;
  social_url?: string;
  social_embed_html?: string;
  cover_image_id?: string;
  media_assets?: MediaAsset[];
}

interface ContentCardProps {
  item: ContentItem;
  navigate: (path: string) => void;
  fetchContent: () => void;
}

const typeIcons = {
  video: Play,
  audio: Music,
  image: ImageIcon,
  text: FileText,
  social: Share2,
  pdf: FileText,
  mixed: FileText
};

const getMediaThumbnail = (item: ContentItem) => {
  // Priority 1: Check media_assets for image or video thumbnails
  if (item.media_assets && item.media_assets.length > 0) {
    for (const asset of item.media_assets) {
      // If it's an image asset with storage_path
      if (asset.kind === 'image' && asset.storage_path) {
        const { data } = supabase.storage.from('content-files').getPublicUrl(asset.storage_path);
        return data.publicUrl;
      }
      // If it's an image asset with external_url
      if (asset.kind === 'image' && asset.external_url) {
        return asset.external_url;
      }
      // If it's a video with thumbnail
      if (asset.kind === 'video' && asset.external_url) {
        if (asset.external_url.includes('youtube.com') || asset.external_url.includes('youtu.be')) {
          const videoId = asset.external_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
          if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
    }
  }
  
  // Priority 2: If social URL exists and is an image, use it
  if (item.social_url) {
    const extension = item.social_url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return item.social_url;
    }
    // For video URLs, try to get thumbnail from common video platforms
    if (item.social_url.includes('youtube.com') || item.social_url.includes('youtu.be')) {
      const videoId = item.social_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // Priority 3: For social embeds, try to extract thumbnail from embed HTML
  if (item.type === 'social' && item.social_embed_html) {
    const thumbnailMatch = item.social_embed_html.match(/poster="([^"]+)"|src="([^"]+\.(jpg|jpeg|png|webp|gif))"/i);
    if (thumbnailMatch) {
      return thumbnailMatch[1] || thumbnailMatch[2];
    }
  }
  
  // Priority 4: Check if cover_image_id exists (from storage bucket)
  if (item.cover_image_id) {
    const { data } = supabase.storage.from('content-files').getPublicUrl(item.cover_image_id);
    return data.publicUrl;
  }
  
  return null;
};

export function ContentCard({ item, navigate, fetchContent }: ContentCardProps) {
  const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
  const thumbnail = getMediaThumbnail(item);

  const toggleFeature = async (field: 'featured' | 'pinned', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ [field]: !currentValue })
        .eq('id', item.id);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleStatusChange = async (newStatus: 'published' | 'draft') => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ status: newStatus })
        .eq('id', item.id);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/content/${item.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app')}>
              <Eye className="h-4 w-4 mr-2" />
              View in Site
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleFeature('featured', item.featured)}>
              <Star className="h-4 w-4 mr-2" />
              {item.featured ? 'Unfeature' : 'Feature'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleFeature('pinned', item.pinned)}>
              <Pin className="h-4 w-4 mr-2" />
              {item.pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            {item.status === 'published' ? (
              <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
                Unpublish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleStatusChange('published')}>
                Publish
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <TypeIcon className="h-12 w-12 text-muted-foreground" />
          )}
          
          {/* Overlay Icons */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute top-2 left-2 flex gap-1">
            {item.featured && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {item.pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
          </div>
          
          {/* Type Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="backdrop-blur-sm bg-background/50">
              <TypeIcon className="h-3 w-3 mr-1" />
              {item.type}
            </Badge>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2 mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {item.strand.replace('_', ' ')}
              </Badge>
              <span>{item.views_count || 0} views</span>
            </div>
            <Badge 
              variant={
                item.status === 'published' ? 'default' : 
                item.status === 'draft' ? 'secondary' : 
                'outline'
              }
            >
              {item.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}