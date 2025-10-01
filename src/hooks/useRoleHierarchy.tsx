import { useAuth } from './useAuth';

/**
 * Role hierarchy levels (higher = more power)
 */
const ROLE_HIERARCHY = {
  uber_admin: 100,      // System-wide (via mm_super_admins)
  super_admin: 50,      // Site owner
  content_admin: 40,
  social_admin: 30,
  moderator: 20,
} as const;

type RoleName = keyof typeof ROLE_HIERARCHY;

export function useRoleHierarchy() {
  const { userRoles, isUberAdmin } = useAuth();

  /**
   * Get the numeric rank for a role
   */
  const getRoleRank = (role: string): number => {
    if (role === 'uber_admin') return ROLE_HIERARCHY.uber_admin;
    return ROLE_HIERARCHY[role as RoleName] || 0;
  };

  /**
   * Get the highest role rank for the current user
   */
  const getCurrentUserRank = (): number => {
    if (isUberAdmin) return ROLE_HIERARCHY.uber_admin;
    
    const ranks = userRoles.map(getRoleRank);
    return ranks.length > 0 ? Math.max(...ranks) : 0;
  };

  /**
   * Check if current user can assign a specific role
   * Rule: Can only assign roles with lower rank than your own
   */
  const canAssignRole = (targetRole: string): boolean => {
    const userRank = getCurrentUserRank();
    const targetRank = getRoleRank(targetRole);
    
    // Must have higher rank to assign
    return userRank > targetRank;
  };

  /**
   * Check if current user can remove a specific role from a user
   */
  const canRemoveRole = (targetRole: string): boolean => {
    const userRank = getCurrentUserRank();
    const targetRank = getRoleRank(targetRole);
    
    // Must have higher rank to remove
    return userRank > targetRank;
  };

  /**
   * Get all roles that the current user can assign
   */
  const getAssignableRoles = (): string[] => {
    const userRank = getCurrentUserRank();
    
    return Object.entries(ROLE_HIERARCHY)
      .filter(([role, rank]) => {
        // Special case: only uber_admins can create other uber_admins
        if (role === 'uber_admin') return isUberAdmin;
        // Can assign if user rank is higher
        return rank < userRank;
      })
      .map(([role]) => role);
  };

  /**
   * Check if a user with given roles can perform an action that requires a minimum role
   */
  const hasMinimumRole = (userRoles: string[], requiredRole: string): boolean => {
    const maxRank = Math.max(...userRoles.map(getRoleRank), 0);
    const requiredRank = getRoleRank(requiredRole);
    return maxRank >= requiredRank;
  };

  /**
   * Get role hierarchy metadata
   */
  const getRoleMetadata = (role: string) => {
    const roleDefinitions = {
      uber_admin: {
        title: 'Uber Admin (System-wide)',
        description: 'Full system access across all sites',
        permissions: [
          'Manage all sites and users',
          'Create other Uber Admins',
          'Push updates across estate',
          'Access master site controls'
        ],
        level: 'System',
        color: 'text-amber-500'
      },
      super_admin: {
        title: 'Super Admin (Site Owner)',
        description: 'Full site control and user management',
        permissions: [
          'Manage site configuration',
          'Create site admins',
          'Full content control',
          'User management'
        ],
        level: 'Site',
        color: 'text-purple-500'
      },
      content_admin: {
        title: 'Content Admin',
        description: 'Manage content, categories, and publishing',
        permissions: [
          'Create/edit content',
          'Manage categories',
          'Publish content',
          'Moderate user content'
        ],
        level: 'Department',
        color: 'text-blue-500'
      },
      social_admin: {
        title: 'Social Admin',
        description: 'Manage social connections and campaigns',
        permissions: [
          'Manage social accounts',
          'Create campaigns',
          'View analytics',
          'Schedule posts'
        ],
        level: 'Department',
        color: 'text-green-500'
      },
      moderator: {
        title: 'Moderator',
        description: 'Basic moderation capabilities',
        permissions: [
          'Moderate comments',
          'Flag content',
          'View reports',
          'Basic user management'
        ],
        level: 'Team',
        color: 'text-gray-500'
      }
    };

    return roleDefinitions[role as RoleName] || {
      title: role,
      description: 'Unknown role',
      permissions: [],
      level: 'Unknown',
      color: 'text-gray-400'
    };
  };

  return {
    getRoleRank,
    getCurrentUserRank,
    canAssignRole,
    canRemoveRole,
    getAssignableRoles,
    hasMinimumRole,
    getRoleMetadata,
    isUberAdmin,
    userRoles
  };
}
