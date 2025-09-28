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
  const isNew = id === 'new';

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

  useEffect(() => {
    fetchCategories();
    fetchPillars();
    if (!isNew && id) {
      fetchContent();
    }
  }, [id, isNew]);

  const fetchContent = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setContent({
          ...data,
          tags: data.tags || [],
          publish_at: data.publish_at?.slice(0, 16) || '', // Format for datetime-local input
        });
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
    try {
      const saveData = {
        ...content,
        status: newStatus || content.status,
        agent_site_id: '00000000-0000-0000-0000-000000000000', // This should come from current agent site
        owner_id: (await supabase.auth.getUser()).data.user?.id,
        publish_at: content.publish_at ? new Date(content.publish_at).toISOString() : null,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('content_items')
          .insert([saveData])
          .select()
          .single();

        if (error) throw error;
        
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
        
        toast({
          title: "Success",
          description: "Content updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
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
                <Label htmlFor="title">Title</Label>
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
                <Label htmlFor="description">Description</Label>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Card>
                <CardHeader>
                <CardTitle>Text Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your text content here..."
                    rows={10}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="audio_url">Audio URL</Label>
                    <Input
                      id="audio_url"
                      value={content.social_url || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, social_url: e.target.value }))}
                      placeholder="https://soundcloud.com/..."
                    />
                  </div>
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