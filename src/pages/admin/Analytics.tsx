import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Clock,
  Star,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalContent: number;
  featuredContent: number;
  avgViewsPerContent: number;
  recentActivity: any[];
  contentByStrand: { strand: string; count: number }[];
  topContent: any[];
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalUsers: 0,
    totalContent: 0,
    featuredContent: 0,
    avgViewsPerContent: 0,
    recentActivity: [],
    contentByStrand: [],
    topContent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch content analytics
      const { data: contentData } = await supabase
        .from('content_items')
        .select('*')
        .order('views_count', { ascending: false });

      // Fetch user count
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id');

      // Fetch user interactions
      const { data: interactionsData } = await supabase
        .from('user_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (contentData) {
        const totalViews = contentData.reduce((sum, item) => sum + (item.views_count || 0), 0);
        const totalContent = contentData.length;
        const featuredContent = contentData.filter(item => item.featured).length;
        const avgViewsPerContent = totalContent > 0 ? Math.round(totalViews / totalContent) : 0;

        // Group content by strand
        const strandCounts = contentData.reduce((acc, item) => {
          const strand = item.strand || 'unknown';
          acc[strand] = (acc[strand] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const contentByStrand = Object.entries(strandCounts).map(([strand, count]) => ({
          strand: strand.replace('_', ' '),
          count
        }));

        setAnalytics({
          totalViews,
          totalUsers: profilesData?.length || 0,
          totalContent,
          featuredContent,
          avgViewsPerContent,
          recentActivity: interactionsData || [],
          contentByStrand,
          topContent: contentData.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      title: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      description: 'Content engagement',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers.toLocaleString(),
      description: 'Registered users',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Content Items',
      value: analytics.totalContent.toLocaleString(),
      description: 'Published content',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Views/Content',
      value: analytics.avgViewsPerContent.toLocaleString(),
      description: 'Engagement rate',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your platform's performance and user engagement
          </p>
        </div>
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

      {/* Content Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Content by Strand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content by Strand
            </CardTitle>
            <CardDescription>Distribution of content across different strands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.contentByStrand.map((item) => (
                <div key={item.strand} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium capitalize">{item.strand}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count} items</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
            <CardDescription>Most viewed content items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topContent.length > 0 ? (
                analytics.topContent.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.strand?.replace('_', ' ')} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {item.views_count || 0} views
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No content data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent User Activity
          </CardTitle>
          <CardDescription>Latest user interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.interaction_type}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {activity.query}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.featuredContent}</div>
              <p className="text-sm text-muted-foreground">Featured Content Items</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalContent > 0 ? 
                  `${Math.round((analytics.featuredContent / analytics.totalContent) * 100)}%` : 
                  '0%'
                }
              </div>
              <p className="text-sm text-muted-foreground">Content Featured Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.totalUsers > 0 ? 
                  Math.round(analytics.totalViews / analytics.totalUsers) : 
                  0
                }
              </div>
              <p className="text-sm text-muted-foreground">Avg Views per User</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}