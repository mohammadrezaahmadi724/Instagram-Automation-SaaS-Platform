export const roleOrder = ['VIEWER', 'AGENT', 'ADMIN', 'OWNER'] as const;
export type AppRole = (typeof roleOrder)[number];

export function roleAtLeast(role: AppRole, minimum: AppRole): boolean {
  return roleOrder.indexOf(role) >= roleOrder.indexOf(minimum);
}
