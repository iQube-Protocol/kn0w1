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
  // If social URL exists and is an image, use it
  if (item.social_url) {
    const extension = item.social_url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return item.social_url;
    }
  }
  
  // Return placeholder based on type
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