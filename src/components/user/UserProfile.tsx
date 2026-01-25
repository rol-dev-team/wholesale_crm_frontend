// src/components/user/UserProfile.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-medium"
      >
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
          {currentUser.name?.charAt(0)}
        </div>
        {currentUser.name}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl p-4 z-50">
          <p className="font-semibold">{currentUser.name}</p>
          <p className="text-sm text-gray-500">{currentUser.email}</p>
          <p className="text-sm">Role: {currentUser.role}</p>

          <hr className="my-3" />

          <button
            onClick={logout}
            className="w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
