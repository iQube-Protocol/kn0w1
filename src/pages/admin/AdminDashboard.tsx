import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  BarChart3, 
  Calendar,
  Plus,
  TrendingUp,
  Eye,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  scheduledContent: number;
  totalViews: number;
  recentActivity: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    scheduledContent: 0,
    totalViews: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch content stats
      const { data: contentStats } = await supabase
        .from('content_items')
        .select('status, views_count, created_at, title')
        .order('created_at', { ascending: false });

      if (contentStats) {
        const totalContent = contentStats.length;
        const publishedContent = contentStats.filter(c => c.status === 'published').length;
        const draftContent = contentStats.filter(c => c.status === 'draft').length;
        const scheduledContent = contentStats.filter(c => c.status === 'scheduled').length;
        const totalViews = contentStats.reduce((sum, c) => sum + (c.views_count || 0), 0);
        const recentActivity = contentStats.slice(0, 5);

        setStats({
          totalContent,
          publishedContent,
          draftContent,
          scheduledContent,
          totalViews,
          recentActivity
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      description: 'All content items',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Published',
      value: stats.publishedContent,
      description: 'Live content',
      icon: PlayCircle,
      color: 'text-green-600'
    },
    {
      title: 'Drafts',
      value: stats.draftContent,
      description: 'Work in progress',
      icon: FileText,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      description: 'Content engagement',
      icon: Eye,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your QriptoMedia content and platform
          </p>
        </div>
        <Button onClick={() => navigate('/admin/content/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Content
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/content/new')}
            >
              <Plus className="h-4 w-4" />
              Create New Content
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/categories')}
            >
              <FileText className="h-4 w-4" />
              Manage Categories
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/social')}
            >
              <TrendingUp className="h-4 w-4" />
              Social Management
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Latest content items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      item.status === 'published' ? 'default' :
                      item.status === 'draft' ? 'secondary' :
                      item.status === 'scheduled' ? 'outline' : 'destructive'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No content items yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}