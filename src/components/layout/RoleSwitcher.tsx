'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole, systemUsers } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '@/api/authAPI';
import { ROLE_LABELS } from '@/constant/constants';

const roleColors: Record<UserRole, string> = {
  kam: 'bg-primary/10 text-primary',
  supervisor: 'bg-success/10 text-success',
  management: 'bg-purple-500/10 text-purple-600',
  super_admin: 'bg-destructive/10 text-destructive',
};

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { currentUser, switchRole, logout } = useAuth();

  if (!currentUser) return null;

  const handleRoleChange = (value: string) => {
    switchRole(value as UserRole);
  };

  const uniqueRoles = Array.from(new Set(systemUsers.map((u) => u.role)));

  return (
    <div className="flex items-center gap-3">
      {/* Role Switcher only for Super Admin */}

      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Role:</span>

        <Select value={currentUser?.role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={currentUser?.id} value={currentUser.role}>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={roleColors[currentUser.role]}>
                  {ROLE_LABELS[currentUser.role]}
                </Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Profile & Logout (all users) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="ml-2 gap-2 h-9 px-3 rounded-full hover:bg-muted/50 transition-all border-muted/60"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium">{currentUser.username}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {currentUser.fullname}
                </span>
              </p>
              <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {currentUser.email || 'user@company.com'}
                </span>
              </p>
              <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {currentUser.phone || '+8801332232111'}
                </span>
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 font-medium"
            onClick={async () => {
              try {
                await AuthAPI.logout();
              } catch (error) {
                console.error('Logout failed on server:', error);
              } finally {
                logout();
                navigate('/login', { replace: true });
              }
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
