import { createContext, useContext, useState, ReactNode } from 'react';
import { SystemUser, UserRole, systemUsers } from '@/data/mockData';

interface AuthContextType {
  currentUser: SystemUser | null;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'view_own_leads'
  | 'view_team_leads'
  | 'view_all_leads'
  | 'view_unassigned_leads'
  | 'create_lead'
  | 'edit_own_leads'
  | 'edit_team_leads'
  | 'edit_all_leads'
  | 'delete_leads'
  | 'assign_leads'
  | 'deny_leads'
  | 'reassign_leads'
  | 'view_own_activities'
  | 'view_team_activities'
  | 'view_all_activities'
  | 'create_activity'
  | 'manage_kams'
  | 'manage_zones'
  | 'create_client'
  | 'view_reports'
  | 'view_team_kpis'
  | 'view_all_kpis'
  | 'manage_settings'
  | 'manage_pipelines'
  | 'manage_departments'
  | 'view_audit_logs'
  | 'set_targets'
  | 'view_back_office_queue';

const rolePermissions: Record<UserRole, Permission[]> = {
  kam: [
    'view_own_leads',
    'create_lead',
    'edit_own_leads',
    'view_own_activities',
    'create_activity',
    'create_client',
  ],
  supervisor: [
    'view_own_leads',
    'view_team_leads',
    'view_unassigned_leads',
    'edit_team_leads',
    'reassign_leads',
    'view_own_activities',
    'view_team_activities',
    'create_activity',
    'view_team_kpis',
    'set_targets',
    'manage_kams',
    'manage_zones',
    'create_client',
    'view_reports',
  ],
  boss: [
    'view_all_leads',
    'view_all_activities',
    'view_all_kpis',
    'view_reports',
  ],
  super_admin: [
    'view_own_leads',
    'view_team_leads',
    'view_all_leads',
    'view_unassigned_leads',
    'create_lead',
    'edit_own_leads',
    'edit_team_leads',
    'edit_all_leads',
    'delete_leads',
    'assign_leads',
    'deny_leads',
    'reassign_leads',
    'view_own_activities',
    'view_team_activities',
    'view_all_activities',
    'create_activity',
    'manage_kams',
    'manage_zones',
    'create_client',
    'view_reports',
    'view_team_kpis',
    'view_all_kpis',
    'manage_settings',
    'manage_pipelines',
    'manage_departments',
    'view_audit_logs',
    'set_targets',
    'view_back_office_queue',
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to super_admin for demo purposes
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(
    systemUsers.find(u => u.role === 'super_admin') || null
  );

  const login = (userId: string) => {
    const user = systemUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    const user = systemUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return rolePermissions[currentUser.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}