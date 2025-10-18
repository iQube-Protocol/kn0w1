import { initAgentiqClient } from '@qriptoagentiq/core-client';

let _core: ReturnType<typeof initAgentiqClient> | null = null;

export async function getCore() {
  if (!_core) _core = initAgentiqClient();
  // Ensure iam.users mirror exists for the logged-in user
  await _core.ensureIamUser();
  return _core;
}

// Optional: centralize tenant/site context from your app state
export function getCtx() {
  // Replace with your actual context wiring
  const tenantId = window.localStorage.getItem('tenantId') || '';
  const siteId   = window.localStorage.getItem('siteId')   || '';
  return { tenantId, siteId };
}
