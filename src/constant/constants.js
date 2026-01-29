export const ROLES = ['super_admin', 'supervisor', 'kam', 'management'];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  supervisor: 'Supervisor',
  kam: 'Key Account Manager',
  management: 'Management',
};

export const USER_STATUS = ['active', 'inactive', 'blocked'];

export const isSuperAdmin = () => getUserRole() === 'super_admin';
export const isSupervisor = () => getUserRole() === 'supervisor';
export const isKAM = () => getUserRole() === 'kam';
export const isManagement = () => getUserRole() === 'management';
