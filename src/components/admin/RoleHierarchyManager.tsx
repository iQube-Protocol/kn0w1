import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Crown, ChevronRight } from 'lucide-react';
import { useRoleHierarchy } from '@/hooks/useRoleHierarchy';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSelectedSiteId } from '@/hooks/useSelectedSiteId';

interface RoleHierarchyManagerProps {
  targetUserId: string;
  currentRoles: string[];
  onRoleUpdated: () => void;
}

export function RoleHierarchyManager({
  targetUserId,
  currentRoles,
  onRoleUpdated
}: RoleHierarchyManagerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const selectedSiteId = useSelectedSiteId();
  const {
    canAssignRole,
    canRemoveRole,
    getAssignableRoles,
    getRoleMetadata,
    getCurrentUserRank,
    isUberAdmin
  } = useRoleHierarchy();

  const assignableRoles = getAssignableRoles();

  const handleAssignRole = async (role: string) => {
    if (!canAssignRole(role)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to assign this role',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role: role as any,
          agent_site_id: selectedSiteId || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${getRoleMetadata(role).title} role assigned successfully`
      });

      onRoleUpdated();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (!canRemoveRole(role)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to remove this role',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role as any);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${getRoleMetadata(role).title} role removed successfully`
      });

      onRoleUpdated();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleCard = (role: string, isAssigned: boolean) => {
    const metadata = getRoleMetadata(role);
    const canAssign = canAssignRole(role);
    const canRemove = canRemoveRole(role);
    const isLocked = !canAssign && !isAssigned;

    return (
      <Card key={role} className={isLocked ? 'opacity-60' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {role === 'uber_admin' && <Crown className="h-4 w-4 text-amber-500" />}
              {role === 'super_admin' && <Shield className="h-4 w-4 text-purple-500" />}
              <CardTitle className="text-sm">{metadata.title}</CardTitle>
              {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </div>
            {isAssigned && (
              <Badge variant="default" className="text-xs">
                Assigned
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">{metadata.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Level: {metadata.level}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {metadata.permissions.map((perm, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          {isAssigned ? (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => handleRemoveRole(role)}
              disabled={loading || !canRemove}
            >
              {canRemove ? 'Remove Role' : 'Cannot Remove'}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={() => handleAssignRole(role)}
              disabled={loading || !canAssign}
            >
              {canAssign ? 'Assign Role' : 'Insufficient Permissions'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">
            Your permission level: {getCurrentUserRank()} {isUberAdmin && '(Uber Admin)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignableRoles.map((role) =>
          renderRoleCard(role, currentRoles.includes(role))
        )}
      </div>

      {assignableRoles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You do not have permission to assign any roles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
