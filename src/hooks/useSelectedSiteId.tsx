import { useParams } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to get the currently selected site ID from URL params or context
 * For Uber Admins: uses siteId from URL params
 * For Site Owners: uses currentSiteId from auth context
 */
export function useSelectedSiteId() {
  const { siteId } = useParams<{ siteId: string }>();
  const { currentSiteId, isUberAdmin } = useAuth();

  // Uber admins use URL param when available; otherwise fall back to current site
  const selectedSiteId = isUberAdmin ? (siteId || currentSiteId) : currentSiteId;

  if (import.meta.env.DEV) {
    console.debug('[useSelectedSiteId]', { siteId, currentSiteId, isUberAdmin, selectedSiteId });
  }

  return selectedSiteId;
}
