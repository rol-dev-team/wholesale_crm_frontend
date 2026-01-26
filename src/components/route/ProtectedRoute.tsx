// src/components/route/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[]; // Optional: allow only specific roles
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const isAuthenticate = localStorage.getItem("user");

  // User not logged in → redirect to login
  if (!isAuthenticate) {
    // return <Navigate to="/login" replace />;
  }

  return children;
};