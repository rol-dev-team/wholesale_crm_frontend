// src/components/route/GuestRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface GuestRouteProps {
  children: JSX.Element;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  //   if (currentUser) {
  //     // Already logged in → redirect to dashboard
  //     return <Navigate to="/dashboard" replace />;
  //   }

  return children;
};
