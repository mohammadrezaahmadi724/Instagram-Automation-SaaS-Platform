export function decideAdminAccess(input: {
  hasSession: boolean;
  isActive: boolean;
  isSuperAdmin: boolean;
}): 'allow' | 'unauthenticated' | 'forbidden' {
  if (!input.hasSession || !input.isActive) return 'unauthenticated';
  if (!input.isSuperAdmin) return 'forbidden';
  return 'allow';
}
