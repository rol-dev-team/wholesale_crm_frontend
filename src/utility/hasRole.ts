// src/utils/hasRole.ts

/**
 * Map backend roles to frontend compatible roles
 * Example: backend might return "admin", "super admin", etc.
 */
const roleMap: Record<string, string> = {
  'super admin': 'super_admin',
  super_admin: 'super_admin',
  management: 'management',
  supervisor: 'supervisor',
  kam: 'kam',
  admin: 'super_admin', // Example if backend sends "admin"
};

/**
 * Check if the current user role is allowed.
 * @param allowedRoles Array of allowed roles, e.g. ['kam', 'supervisor']
 * @param currentRole Optional role string to override localStorage
 * @returns boolean
 */
export function hasRole(allowedRoles: string[], currentRole?: string): boolean {
  // Get role from currentRole argument or localStorage
  const storedRole = currentRole || localStorage.getItem('role') || '';

  // Normalize role to frontend compatible
  const normalizedRole = roleMap[storedRole.toLowerCase()] || '';

  if (!normalizedRole) return false;

  // Compare allowedRoles (case-insensitive)
  return allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole);
}
