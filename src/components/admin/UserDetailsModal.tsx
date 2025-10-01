import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Award,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RoleHierarchyManager } from './RoleHierarchyManager';
import { RoleAuditLog } from './RoleAuditLog';

interface UserDetailsModalProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
    profile: {
      first_name: string | null;
      last_name: string | null;
      total_points: number;
      level: number;
      civic_status: string | null;
    } | null;
    roles: Array<{ role: string }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const ROLE_DESCRIPTIONS = {
  super_admin: {
    title: 'Super Admin (Site Owner)',
    description: 'Full platform access, can create sites from master template, manage all users and content',
    permissions: ['Create agent sites', 'Manage all users', 'Full content control', 'System configuration']
  },
  content_admin: {
    title: 'Content Admin',
    description: 'Manage content, categories, and publishing',
    permissions: ['Create/edit content', 'Manage categories', 'Publish content', 'Moderate user content']
  },
  social_admin: {
    title: 'Social Admin',
    description: 'Manage social connections and campaigns',
    permissions: ['Manage social accounts', 'Create campaigns', 'View analytics', 'Schedule posts']
  },
  moderator: {
    title: 'Moderator',
    description: 'Basic moderation capabilities',
    permissions: ['Moderate comments', 'Flag content', 'View reports', 'Basic user management']
  }
};

export function UserDetailsModal({ user, open, onOpenChange, onUserUpdated }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const userRoles = user.roles.map(r => r.role);

  const assignRole = async (role: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.id, 
          role: role as 'super_admin' | 'content_admin' | 'social_admin' | 'moderator'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS].title} role assigned successfully.`,
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (role: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', role as 'super_admin' | 'content_admin' | 'social_admin' | 'moderator');

      if (error) throw error;

      toast({
        title: "Success",
        description: `${role.replace('_', ' ')} role removed successfully.`,
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details & Role Management
          </DialogTitle>
          <DialogDescription>
            View user information and manage roles with hierarchy-aware controls
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">User Info</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {user.profile?.first_name && user.profile?.last_name
                      ? `${user.profile.first_name} ${user.profile.last_name}`
                      : 'No name provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.email_confirmed_at ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Email Status</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                  </p>
                </div>
              </div>

              {user.profile && (
                <>
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Level & Points</p>
                      <p className="text-sm text-muted-foreground">
                        Level {user.profile.level} • {user.profile.total_points} points
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <RoleHierarchyManager
              targetUserId={user.id}
              currentRoles={userRoles}
              onRoleUpdated={onUserUpdated}
            />
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <RoleAuditLog targetUserId={user.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
