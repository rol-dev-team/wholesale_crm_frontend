import moment from 'moment';
import { ROLES } from '@/constant/constants';

export const dateTimeFormat = (date) => {
  return moment(date).format('LLL');
};

export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const hasUserRole = (ROLES, userRole) => {
  return ROLES.includes(userRole);
};

/* ---------------- USER ROLE ---------------- */
export const getUserRole = () => {
  const user = getUserInfo();
  return user?.role || null;
};

/* ---------------- SPECIFIC ROLE HELPERS ---------------- */
export const isSuperAdmin = () => getUserRole() === 'super_admin';
export const isSupervisor = () => getUserRole() === 'supervisor';
export const isKAM = () => getUserRole() === 'kam';
export const isManagement = () => getUserRole() === 'management';
