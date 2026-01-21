// import { useAuth } from '@/contexts/AuthContext';
// import { UserRole, systemUsers } from '@/data/mockData';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { User } from 'lucide-react';

// const roleLabels: Record<UserRole, string> = {
//   kam: 'KAM',
//   supervisor: 'Supervisor',
//   boss: 'Management',
//   super_admin: 'Super Admin',
// };

// const roleColors: Record<UserRole, string> = {
//   kam: 'bg-primary/10 text-primary',
//   supervisor: 'bg-success/10 text-success',
//   boss: 'bg-purple-500/10 text-purple-600',
//   super_admin: 'bg-destructive/10 text-destructive',
// };

// export function RoleSwitcher() {
//   const { currentUser, switchRole } = useAuth();

//   const handleRoleChange = (value: string) => {
//     switchRole(value as UserRole);
//   };

//   const uniqueRoles = Array.from(new Set(systemUsers.map(u => u.role)));

//   return (
//     <div className="flex items-center gap-3">
//       <div className="flex items-center gap-2">
//         <User className="h-4 w-4 text-muted-foreground" />
//         <span className="text-sm text-muted-foreground">Switch Role:</span>
//       </div>
//       <Select value={currentUser?.role} onValueChange={handleRoleChange}>
//         <SelectTrigger className="w-[200px] h-9">
//           <SelectValue placeholder="Select role" />
//         </SelectTrigger>
//         <SelectContent>
//           {uniqueRoles.map((role) => (
//             <SelectItem key={role} value={role}>
//               <div className="flex items-center gap-2">
//                 <Badge variant="secondary" className={roleColors[role]}>
//                   {roleLabels[role]}
//                 </Badge>
//               </div>
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//       {currentUser && (
//         <Badge variant="outline" className="ml-2">
//           {currentUser.name}
//         </Badge>
//       )}
//     </div>
//   );
// }

"use client";

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Mail, ShieldCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();
  const { currentUser, switchRole, logout } = useAuth(); // Assuming logout exists in your context

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

      {/* --- PROFILE DROPDOWN REPLACING STATIC BADGE --- */}
      {currentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2 gap-2 h-9 px-3 rounded-full hover:bg-muted/50 transition-all border-muted/60">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">{currentUser.name}</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-slate-900">{currentUser.name}</p>
                <p className="text-xs mt-4 leading-none text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" /> {currentUser.email || 'user@company.com'}
                </p>
                <p className="text-xs mt-4 leading-none text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3" /> {+8801332232111 || '+8801332222111'}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2 font-medium"
              onClick={() => {
  logout?.();                 // clear auth state
  navigate("/login", { replace: true }); // redirect
}}

            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}