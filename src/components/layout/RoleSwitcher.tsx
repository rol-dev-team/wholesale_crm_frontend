import { useAuth } from '@/contexts/AuthContext';
import { UserRole, systemUsers } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const roleLabels: Record<UserRole, string> = {
  kam: 'KAM',
  supervisor: 'Supervisor',
  boss: 'Management',
  super_admin: 'Super Admin',
};

const roleColors: Record<UserRole, string> = {
  kam: 'bg-primary/10 text-primary',
  supervisor: 'bg-success/10 text-success',
  boss: 'bg-purple-500/10 text-purple-600',
  super_admin: 'bg-destructive/10 text-destructive',
};

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuth();

  const handleRoleChange = (value: string) => {
    switchRole(value as UserRole);
  };

  const uniqueRoles = Array.from(new Set(systemUsers.map(u => u.role)));

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Switch Role:</span>
      </div>
      <Select value={currentUser?.role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {uniqueRoles.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={roleColors[role]}>
                  {roleLabels[role]}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentUser && (
        <Badge variant="outline" className="ml-2">
          {currentUser.name}
        </Badge>
      )}
    </div>
  );
}
