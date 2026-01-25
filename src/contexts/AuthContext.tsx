// AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { SystemUser, UserRole, systemUsers } from '@/data/mockData';
import { SystemUser, UserRole } from '@/data/mockData';

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

interface AuthContextType {
  currentUser: SystemUser | null;
  // login: (userId: string) => void;
  login: (user: SystemUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

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
  management: [
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
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const login = (user: SystemUser) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  const switchRole = (role: UserRole) => {
    const user = systemUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  const hasPermission = (permission: Permission) => {
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
