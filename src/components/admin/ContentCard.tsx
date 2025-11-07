import React, { useState, useEffect } from 'react';
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
  Pin,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseButton } from '@/components/x402/PurchaseButton';
import content1 from '@/assets/content-1.jpg';
import content2 from '@/assets/content-2.jpg';
import content3 from '@/assets/content-3.jpg';
import heroImage from '@/assets/hero-image.jpg';

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
  social_url?: string;
  social_embed_html?: string;
  cover_image_id?: string;
  media_assets?: MediaAsset[];
  category?: { name: string; slug?: string } | null;
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
          const videoId = asset.external_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)?.[1];
          if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        if (asset.external_url.includes('vimeo.com')) {
          const vimeoId = asset.external_url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
          if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
        }
      }
    }
  }
  
  // Priority 2: If social URL exists, try to derive a thumbnail regardless of type
  if (item.social_url) {
    const extension = item.social_url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return item.social_url;
    }
    // YouTube
    if (item.social_url.includes('youtube.com') || item.social_url.includes('youtu.be')) {
      const videoId = item.social_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)?.[1];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    // Vimeo
    if (item.social_url.includes('vimeo.com')) {
      const vimeoId = item.social_url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
      if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
    }
  }
  
  // Priority 3: For social embeds, try to extract thumbnail from embed HTML
  if (item.social_embed_html) {
    const thumbnailMatch = item.social_embed_html.match(/poster="([^"]+)"|src="([^"]+\.(jpg|jpeg|png|webp|gif))"/i);
    const raw = (thumbnailMatch && (thumbnailMatch[1] || thumbnailMatch[2])) || '';
    if (raw) {
      // Map local dev paths to bundled assets
      if (raw.includes('/src/assets/')) {
        const file = raw.split('/').pop();
        const map: Record<string, string> = {
          'content-1.jpg': content1,
          'content-2.jpg': content2,
          'content-3.jpg': content3,
          'hero-image.jpg': heroImage,
        };
        if (file && map[file]) return map[file];
      }
      return raw;
    }
  }
  
  // Priority 4: Check if cover_image_id exists (from storage bucket)
  if (item.cover_image_id) {
    const { data } = supabase.storage.from('content-files').getPublicUrl(item.cover_image_id);
    return data.publicUrl;
  }
  
  // Priority 5: Category-based default fallbacks
  const categorySlug = item.category?.slug || '';
  const categoryDefaults: Record<string, string> = {
    'epic-stories': content1,
    'masterclass': content2,
    'documentary': content3,
    'impact-projects': content3,
  };
  
  return categoryDefaults[categorySlug] || heroImage;
};

export function ContentCard({ item, navigate, fetchContent }: ContentCardProps) {
  const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
  const thumbnail = getMediaThumbnail(item);
  const [assetPolicy, setAssetPolicy] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  console.debug('ContentCard thumbnail', { id: item.id, title: item.title, type: item.type, social_url: item.social_url, hasEmbed: !!item.social_embed_html, mediaCount: item.media_assets?.length || 0, thumbnail });

  useEffect(() => {
    fetchAssetPolicy();
    checkAccess();
  }, [item.id]);

  const fetchAssetPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_policies')
        .select('*')
        .eq('asset_id', item.id)
        .maybeSingle();

      if (!error && data) {
        setAssetPolicy(data);
      }
    } catch (error) {
      console.error('Error fetching asset policy:', error);
    }
  };

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('entitlements')
        .select('id')
        .eq('asset_id', item.id)
        .eq('holder_user_id', user.id)
        .maybeSingle();

      setHasAccess(!!data);
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

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
          <img 
            src={thumbnail} 
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = heroImage;
            }}
          />
          
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
            <div className="flex items-center gap-2">
              {assetPolicy && assetPolicy.price_amount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {assetPolicy.price_amount} {assetPolicy.price_asset}
                </Badge>
              )}
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

          {/* Purchase Button - Only show if published and has policy */}
          {item.status === 'published' && assetPolicy && (
            <div className="pt-3 border-t">
              <PurchaseButton
                assetId={item.id}
                policy={assetPolicy}
                hasAccess={hasAccess}
                onPurchaseComplete={() => {
                  checkAccess();
                  fetchContent();
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}