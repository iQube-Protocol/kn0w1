import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  user_id: string;
  target_user_id: string;
  action: 'assigned' | 'removed';
  role: string;
  agent_site_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

interface RoleAuditLogProps {
  targetUserId: string;
  maxEntries?: number;
}

export function RoleAuditLog({ targetUserId, maxEntries = 10 }: RoleAuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, [targetUserId]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .eq('target_user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(maxEntries);

      if (error) throw error;

      setLogs((data as AuditLogEntry[]) || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load role change history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Role Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Role Change History
        </CardTitle>
        <CardDescription>
          Recent role assignments and removals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No role changes recorded
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className={`mt-0.5 ${log.action === 'assigned' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.action === 'assigned' ? (
                      <UserPlus className="h-4 w-4" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={log.action === 'assigned' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {log.action === 'assigned' ? 'Assigned' : 'Removed'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {log.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {log.agent_site_id && (
                      <p className="text-xs text-muted-foreground">
                        Site ID: {log.agent_site_id.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
