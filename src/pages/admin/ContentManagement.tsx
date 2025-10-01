import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSelectedSiteId } from '@/hooks/useSelectedSiteId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Calendar,
  MoreHorizontal,
  Star,
  Pin,
  Grid3x3,
  List,
  Play,
  FileText,
  Image as ImageIcon,
  Music,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContentCard } from '@/components/admin/ContentCard';
import { useToast } from '@/hooks/use-toast';

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
}

export function ContentManagement() {
  const selectedSiteId = useSelectedSiteId();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [strandFilter, setStrandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSiteId) {
      fetchContent();
    }
  }, [selectedSiteId]);

  const fetchContent = async () => {
    if (!selectedSiteId) {
      if (import.meta.env.DEV) {
        console.debug('[ContentManagement] No selectedSiteId yet');
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          category:content_categories(name, slug),
          media_assets(id, kind, storage_path, external_url, oembed_html)
        `)
        .eq('agent_site_id', selectedSiteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (import.meta.env.DEV) {
        console.debug('[ContentManagement] Loaded content for site:', selectedSiteId, data?.length || 0);
      }
      
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesStrand = strandFilter === 'all' || item.strand === strandFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesStrand && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const validStatuses = ['published', 'draft', 'scheduled', 'in_review', 'archived'] as const;
    type ValidStatus = typeof validStatuses[number];
    
    const variants: Record<ValidStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      published: 'default',
      draft: 'secondary', 
      scheduled: 'outline',
      in_review: 'secondary',
      archived: 'destructive'
    };
    
    const variant = variants[status as ValidStatus] || 'secondary';
    
    return (
      <Badge variant={variant}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleStatusChange = async (id: string, newStatus: 'published' | 'draft' | 'scheduled' | 'in_review' | 'archived') => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchContent(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const toggleFeature = async (id: string, currentValue: boolean, field: 'featured' | 'pinned') => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ [field]: !currentValue })
        .eq('id', id);

      if (error) throw error;
      fetchContent(); // Refresh the list
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleRegenerateThumbnails = async () => {
    try {
      toast({
        title: "Regenerating thumbnails",
        description: "This may take a moment...",
      });

      const { data, error } = await supabase.functions.invoke('backfill-media-assets');

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${data.created} thumbnails (${data.generatedImages} AI-generated)`,
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your content library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateThumbnails}
          >
            Regenerate Thumbnails
          </Button>
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate('/admin/content/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={strandFilter} onValueChange={setStrandFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by strand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strands</SelectItem>
                <SelectItem value="civic_readiness">Civic Readiness</SelectItem>
                <SelectItem value="learn_to_earn">Learn to Earn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="text">Article/Text</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="social">Social Post</SelectItem>
                <SelectItem value="mixed">Mixed Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Display */}
      <Card>
        <CardHeader>
          <CardTitle>Content Items ({filteredContent.length})</CardTitle>
          <CardDescription>
            Manage your content library
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((item) => (
                <ContentCard key={item.id} item={item} navigate={navigate} fetchContent={fetchContent} />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Strand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {item.featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        {item.pinned && (
                          <Pin className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.strand.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.category?.name || 'Uncategorized'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell>{item.views_count || 0}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                        <DropdownMenuItem
                          onClick={() => toggleFeature(item.id, item.featured, 'featured')}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {item.featured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleFeature(item.id, item.pinned, 'pinned')}
                        >
                          <Pin className="h-4 w-4 mr-2" />
                          {item.pinned ? 'Unpin' : 'Pin'}
                        </DropdownMenuItem>
                        {item.status === 'published' ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, 'draft')}
                          >
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(item.id, 'published')}
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
          
          {filteredContent.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No content items found</p>
              <Button 
                onClick={() => navigate('/admin/content/new')} 
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}