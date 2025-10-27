import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Upload,
  Calendar,
  Star,
  Pin,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/admin/FileUpload';
import { AIContentGenerator } from '@/components/admin/AIContentGenerator';
import content1 from '@/assets/content-1.jpg';
import content2 from '@/assets/content-2.jpg';
import content3 from '@/assets/content-3.jpg';
import heroImage from '@/assets/hero-image.jpg';

interface ContentItem {
  id?: string;
  title: string;
  description: string;
  slug: string;
  strand: 'civic_readiness' | 'learn_to_earn';
  type: 'audio' | 'video' | 'text' | 'pdf' | 'image' | 'mixed' | 'social';
  status: 'draft' | 'published' | 'scheduled' | 'in_review' | 'archived';
  category_id?: string;
  pillar_id?: string;
  featured: boolean;
  pinned: boolean;
  tags: string[];
  l2e_points: number;
  social_source?: string;
  social_url?: string;
  social_embed_html?: string;
  l2e_quiz_url?: string;
  l2e_cta_label?: string;
  l2e_cta_url?: string;
  publish_at?: string;
  contentqube_id?: string;
  tokenqube_ref?: string;
}

interface Category {
  id: string;
  name: string;
  strand: string;
}

interface Pillar {
  id: string;
  display_name: string;
}

export function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id || id === 'new';

  const [content, setContent] = useState<ContentItem>({
    title: '',
    description: '',
    slug: '',
    strand: 'civic_readiness',
    type: 'text',
    status: 'draft',
    featured: false,
    pinned: false,
    tags: [],
    l2e_points: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [agentSiteId, setAgentSiteId] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    kind: 'audio' | 'image' | 'mixed' | 'pdf' | 'social' | 'text' | 'video';
    storage_path?: string;
    external_url?: string;
    file_type?: string;
  }>>([]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchCategories(), fetchPillars()]);
      
      // Get agent site ID
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: agentSite } = await supabase
          .from('agent_sites')
          .select('id')
          .eq('owner_user_id', userData.user.id)
          .single();
        
        if (agentSite) {
          setAgentSiteId(agentSite.id);
        }
      }
      
      if (isNew) {
        setLoading(false);
      } else if (id) {
        await fetchContent();
      }
    };
    initializeData();
  }, [id, isNew]);

  const fetchContent = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          media_assets(id, kind, storage_path, external_url, oembed_html)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setContent({
          ...data,
          tags: data.tags || [],
          publish_at: data.publish_at?.slice(0, 16) || '', // Format for datetime-local input
        });
        
        setMediaAssets(data.media_assets || []);
        
        // Set thumbnail URL using priority logic
        let thumbnail = '';
        
        // Priority 1: media_assets
        if (data.media_assets && data.media_assets.length > 0) {
          for (const asset of data.media_assets) {
            if (asset.kind === 'image' && asset.storage_path) {
              const { data: urlData } = supabase.storage.from('content-files').getPublicUrl(asset.storage_path);
              thumbnail = urlData.publicUrl;
              break;
            }
            if (asset.kind === 'image' && asset.external_url) {
              thumbnail = asset.external_url;
              break;
            }
            if (asset.kind === 'video' && asset.external_url) {
              if (asset.external_url.includes('youtube.com') || asset.external_url.includes('youtu.be')) {
                const videoId = asset.external_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
                if (videoId) {
                  thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  break;
                }
              }
            }
          }
        }
        
        // Priority 2: social_url
        if (!thumbnail && data.social_url) {
          const extension = data.social_url.split('.').pop()?.toLowerCase();
          if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
            thumbnail = data.social_url;
          } else if (data.social_url.includes('youtube.com') || data.social_url.includes('youtu.be')) {
            const videoId = data.social_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
            if (videoId) thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }
        
        // Priority 3: cover_image_id
        if (!thumbnail && data.cover_image_id) {
          const { data: urlData } = supabase.storage.from('content-files').getPublicUrl(data.cover_image_id);
          thumbnail = urlData.publicUrl;
        }
        
        // Priority 4: Category default fallback
        if (!thumbnail) {
          const categoryDefaults: Record<string, string> = {
            'epic-stories': content1,
            'masterclass': content2,
            'documentary': content3,
            'impact-projects': content3,
          };
          thumbnail = categoryDefaults[data.category_id] || heroImage;
        }
        
        setThumbnailUrl(thumbnail);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('id, name, strand')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPillars = async () => {
    try {
      const { data, error } = await supabase
        .from('mission_pillars')
        .select('id, display_name')
        .order('display_name');

      if (error) throw error;
      setPillars(data || []);
    } catch (error) {
      console.error('Error fetching pillars:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Ensure slug is unique per agent site by appending -2, -3, ... if needed
  const ensureUniqueSlug = async (
    baseSlug: string,
    agentSiteId: string,
    currentId?: string
  ) => {
    let normalized = (baseSlug || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let candidate = normalized;
    let suffix = 2;
    let attempts = 0;

    while (true) {
      attempts++;
      if (attempts > 50) {
        // Prevent any chance of an infinite loop
        console.error('ensureUniqueSlug exceeded 50 attempts, using fallback candidate:', candidate);
        return `${normalized}-${Date.now()}`;
      }

      const { data, error } = await supabase
        .from('content_items')
        .select('id, slug')
        .eq('agent_site_id', agentSiteId)
        .eq('slug', candidate)
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" for maybeSingle - not an actual error
        console.warn('ensureUniqueSlug select warning:', error);
      }

      if (!data) {
        return candidate; // available
      }

      if (currentId && data.id === currentId) {
        return candidate; // same record, allowed
      }

      candidate = `${normalized}-${suffix++}`;
    }
  };

  const handleTitleChange = (value: string) => {
    setContent(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !content.tags.includes(tagInput.trim())) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setContent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async (newStatus?: typeof content.status) => {
    setSaving(true);
    console.debug('[ContentEditor] handleSave start', { newStatus, isNew });
    try {
      // Get the current user's agent site
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      let { data: agentSiteData } = await supabase
        .from('agent_sites')
        .select('id')
        .eq('owner_user_id', userData.user.id)
        .maybeSingle();

      console.debug('[ContentEditor] agentSite lookup', { agentSiteId: agentSiteData?.id });

      // Create agent site if it doesn't exist
      if (!agentSiteData) {
        const { data: newSite, error: createError } = await supabase
          .from('agent_sites')
          .insert({
            owner_user_id: userData.user.id,
            site_slug: `${userData.user.email?.replace('@', '-').replace('.', '-')}-site`,
            title: `${userData.user.email} Agent Site`,
            display_name: `${userData.user.email} Agent Site`,
            status: 'active'
          })
          .select('id')
          .single();
          
        if (createError) throw createError;
        agentSiteData = newSite;

        // Clone master template content for new site
        try {
          console.debug('[ContentEditor] Cloning master template for new site', agentSiteData.id);
          const clonePromise = supabase.functions.invoke('clone-master-template', {
            body: { 
              agentSiteId: agentSiteData.id,
              userEmail: userData.user.email 
            }
          });

          // Don't let cloning block content creation indefinitely
          const result: any = await Promise.race([
            clonePromise,
            new Promise((resolve) => setTimeout(() => resolve({ error: { message: 'timeout' } }), 10000))
          ]);

          if (result?.error) {
            console.error('Failed to clone master template:', result.error);
            toast({
              title: "Site Created",
              description: "Site created but template cloning failed. You can add content manually.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Site Created",
              description: "New site created with sample content from METAKNYT master template."
            });
          }
        } catch (templateError) {
          console.error('Template cloning error:', templateError);
        }
      }

      // Exclude media_assets from save data (it's a separate table)
      const { media_assets, ...contentToSave } = content as any;
      
      // Ensure slug exists and is unique per agent site
      const baseSlug = (contentToSave.slug || generateSlug(contentToSave.title));
      const uniqueSlug = await ensureUniqueSlug(baseSlug, agentSiteData.id, isNew ? undefined : (id as string));
      console.debug('[ContentEditor] Slug check', { baseSlug, uniqueSlug, agentSiteId: agentSiteData.id });
      if (baseSlug !== uniqueSlug) {
        toast({ title: 'Slug adjusted', description: `Using "${uniqueSlug}" to avoid duplicates.` });
      }
      
      const saveData = {
        ...contentToSave,
        slug: uniqueSlug,
        status: newStatus || content.status,
        agent_site_id: agentSiteData.id,
        owner_id: userData.user.id,
        publish_at: content.publish_at ? new Date(content.publish_at).toISOString() : null,
      };

      let contentItemId = id;

      if (isNew) {
        console.debug('[ContentEditor] creating content_items', { saveData });
        const { data, error } = await supabase
          .from('content_items')
          .insert([saveData])
          .select()
          .single();

        if (error) throw error;
        contentItemId = data.id;
        
        // Create media_assets records for uploaded files
        if (uploadedFiles.length > 0) {
          const mediaAssetRecords = uploadedFiles.map(file => ({
            content_item_id: contentItemId,
            kind: file.kind,
            storage_path: file.storage_path,
            external_url: file.external_url,
            mime_type: file.file_type
          }));

          const { error: mediaError } = await supabase
            .from('media_assets')
            .insert(mediaAssetRecords);

          if (mediaError) {
            console.error('Error creating media assets:', mediaError);
            toast({
              title: "Warning",
              description: "Content saved but some media assets failed to link",
              variant: "destructive",
            });
          }
        }
        
        toast({
          title: "Success",
          description: "Content created successfully",
        });
        
        navigate(`/admin/content/${data.id}`);
      } else {
        const { error } = await supabase
          .from('content_items')
          .update(saveData)
          .eq('id', id);

        if (error) throw error;

        // Create media_assets records for newly uploaded files
        if (uploadedFiles.length > 0) {
          const mediaAssetRecords = uploadedFiles.map(file => ({
            content_item_id: contentItemId,
            kind: file.kind,
            storage_path: file.storage_path,
            external_url: file.external_url,
            mime_type: file.file_type
          }));

          const { error: mediaError } = await supabase
            .from('media_assets')
            .insert(mediaAssetRecords);

          if (mediaError) {
            console.error('Error creating media assets:', mediaError);
            toast({
              title: "Warning",
              description: "Content updated but some media assets failed to link",
              variant: "destructive",
            });
          }
        }
        
        toast({
          title: "Success",
          description: "Content updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      const message = (error as any)?.message || 'Failed to save content';
      const friendly = message.includes('duplicate key') ? 'Slug already exists for this site. Please try again.' : message;
      toast({
        title: 'Error',
        description: friendly,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.strand === content.strand);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/content')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Create Content' : 'Edit Content'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Create a new content item' : 'Edit your content item'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={() => handleSave('draft')} 
            disabled={saving}
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('published')} 
            disabled={saving}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set the title, description, and other basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <AIContentGenerator 
                    type="title"
                    currentValue={content.title}
                    agentSiteId={agentSiteId}
                    onGenerated={(title) => handleTitleChange(title)}
                  />
                </div>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter content title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={content.slug}
                  onChange={(e) => setContent(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="content-slug"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <AIContentGenerator 
                    type="description"
                    currentValue={content.description}
                    agentSiteId={agentSiteId}
                    onGenerated={(desc) => setContent(prev => ({ ...prev, description: desc }))}
                  />
                </div>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter content description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Type Specific Fields */}
          <Tabs value={content.type} onValueChange={(value: any) => setContent(prev => ({ ...prev, type: value }))}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Text Content</CardTitle>
                    <AIContentGenerator 
                      type="content"
                      currentValue={content.social_embed_html || ''}
                      agentSiteId={agentSiteId}
                      onGenerated={(text) => setContent(prev => ({ ...prev, social_embed_html: text }))}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write your text content here or generate with AI..."
                    rows={10}
                    value={content.social_embed_html || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, social_embed_html: e.target.value }))}
                  />
                  
                  {/* PDF Upload for Text Content */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium">PDF Upload</h4>
                    <FileUpload
                      label="Upload PDF Document"
                      description="Upload a PDF file to accompany this text content"
                      accept=".pdf"
                      maxSize={25}
                      currentFile={content.social_url}
                      onFileUploaded={(data) => {
                        setContent(prev => ({ ...prev, social_url: data.url }));
                        setUploadedFiles(prev => [...prev, { kind: 'pdf', storage_path: data.storagePath, file_type: data.fileType }]);
                      }}
                      onRemoveFile={() => setContent(prev => ({ ...prev, social_url: '' }))}
                    />
                  </div>
                  
                  {/* Learn to Earn Settings for Text Content */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-medium">Learn to Earn Settings</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="l2e_points">Points Value</Label>
                      <Input
                        id="l2e_points"
                        type="number"
                        value={content.l2e_points}
                        onChange={(e) => setContent(prev => ({ ...prev, l2e_points: Number(e.target.value) }))}
                        placeholder="Points earned for completing this content"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="l2e_quiz_url">Quiz URL (Optional)</Label>
                      <Input
                        id="l2e_quiz_url"
                        value={content.l2e_quiz_url || ''}
                        onChange={(e) => setContent(prev => ({ ...prev, l2e_quiz_url: e.target.value }))}
                        placeholder="https://quiz.example.com/..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="l2e_cta_label">CTA Label</Label>
                        <Input
                          id="l2e_cta_label"
                          value={content.l2e_cta_label || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, l2e_cta_label: e.target.value }))}
                          placeholder="Take Quiz"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="l2e_cta_url">CTA URL</Label>
                        <Input
                          id="l2e_cta_url"
                          value={content.l2e_cta_url || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, l2e_cta_url: e.target.value }))}
                          placeholder="https://action.example.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Image Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload
                    label="Upload Image"
                    description="Upload an image file (JPG, PNG, WebP, GIF)"
                    accept="image/*"
                    maxSize={10}
                    currentFile={content.social_url}
                    onFileUploaded={(data) => {
                      setContent(prev => ({ ...prev, social_url: data.url }));
                      setUploadedFiles(prev => [...prev, { kind: 'image', storage_path: data.storagePath, file_type: data.fileType }]);
                    }}
                    onRemoveFile={() => setContent(prev => ({ ...prev, social_url: '' }))}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_alt">Alt Text</Label>
                    <Input
                      id="image_alt"
                      value={content.social_embed_html || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, social_embed_html: e.target.value }))}
                      placeholder="Describe the image for accessibility..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Video</TabsTrigger>
                      <TabsTrigger value="url">Video URL/Embed</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <FileUpload
                        label="Upload Video File"
                        description="Upload a video file (MP4, MOV, AVI, etc.)"
                        accept="video/*"
                        maxSize={100}
                        currentFile={content.social_url}
                        onFileUploaded={(data) => {
                          setContent(prev => ({ ...prev, social_url: data.url }));
                          setUploadedFiles(prev => [...prev, { kind: 'video', storage_path: data.storagePath, file_type: data.fileType }]);
                        }}
                        onRemoveFile={() => setContent(prev => ({ ...prev, social_url: '' }))}
                      />
                    </TabsContent>
                    
                    <TabsContent value="url" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="social_url">Video URL</Label>
                        <Input
                          id="social_url"
                          value={content.social_url || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, social_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="social_embed_html">Embed HTML (Optional)</Label>
                        <Textarea
                          id="social_embed_html"
                          value={content.social_embed_html || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, social_embed_html: e.target.value }))}
                          placeholder="<iframe>...</iframe>"
                          rows={3}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                      <TabsTrigger value="url">Audio URL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <FileUpload
                        label="Upload Audio File"
                        description="Upload an audio file (MP3, WAV, M4A, etc.)"
                        accept="audio/*"
                        maxSize={50}
                        currentFile={content.social_url}
                        onFileUploaded={(data) => {
                          setContent(prev => ({ ...prev, social_url: data.url }));
                          setUploadedFiles(prev => [...prev, { kind: 'audio', storage_path: data.storagePath, file_type: data.fileType }]);
                        }}
                        onRemoveFile={() => setContent(prev => ({ ...prev, social_url: '' }))}
                      />
                    </TabsContent>
                    
                    <TabsContent value="url" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="audio_url">Audio URL</Label>
                        <Input
                          id="audio_url"
                          value={content.social_url || ''}
                          onChange={(e) => setContent(prev => ({ ...prev, social_url: e.target.value }))}
                          placeholder="https://soundcloud.com/..."
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                <CardTitle>Social Content Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social_source">Social Source</Label>
                  <Input
                    id="social_source"
                    value={content.social_source || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, social_source: e.target.value }))}
                    placeholder="Twitter, Instagram, etc."
                  />
                </div>
                  
                <div className="space-y-2">
                  <Label htmlFor="social_url">Social URL</Label>
                  <Input
                    id="social_url"
                    value={content.social_url || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, social_url: e.target.value }))}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="social_embed_html">Embed HTML (Optional)</Label>
                  <Textarea
                    id="social_embed_html"
                    value={content.social_embed_html || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, social_embed_html: e.target.value }))}
                    placeholder="<blockquote>...</blockquote>"
                    rows={3}
                  />
                </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Media Preview */}
          {thumbnailUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Media Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={thumbnailUrl} 
                    alt={content.title || 'Content preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Current thumbnail
                </p>
              </CardContent>
            </Card>
          )}

          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={content.status} onValueChange={(value: any) => setContent(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {content.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="publish_at">Publish Date</Label>
                  <Input
                    id="publish_at"
                    type="datetime-local"
                    value={content.publish_at || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, publish_at: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={content.featured}
                  onCheckedChange={(checked) => setContent(prev => ({ ...prev, featured: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pinned">Pinned</Label>
                <Switch
                  id="pinned"
                  checked={content.pinned}
                  onCheckedChange={(checked) => setContent(prev => ({ ...prev, pinned: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strand">Strand</Label>
                <Select value={content.strand} onValueChange={(value: any) => setContent(prev => ({ ...prev, strand: value, category_id: undefined }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civic_readiness">Civic Readiness</SelectItem>
                    <SelectItem value="learn_to_earn">Learn to Earn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={content.category_id || ''} onValueChange={(value) => setContent(prev => ({ ...prev, category_id: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pillar">Mission Pillar</Label>
                <Select value={content.pillar_id || ''} onValueChange={(value) => setContent(prev => ({ ...prev, pillar_id: value || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars.map(pillar => (
                      <SelectItem key={pillar.id} value={pillar.id}>
                        {pillar.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="l2e_points">L2E Points</Label>
                <Input
                  id="l2e_points"
                  type="number"
                  min="0"
                  value={content.l2e_points}
                  onChange={(e) => setContent(prev => ({ ...prev, l2e_points: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag..."
                />
                <Button size="sm" onClick={addTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {content.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}