"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Edit } from "lucide-react";
import { SystemUser, UserRole } from "./CreateSystemUserForm";
import api from "@/api/axiosInstance";

/* ---------------- Component ---------------- */
export function SystemUserList() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  /* ---------------- Fetch Users ---------------- */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      // response = { status: true, message, data: [...], meta }

      if (!Array.isArray(response.data)) {
        console.error("Expected array in response.data but got:", response.data);
        return;
      }

      const mappedUsers: SystemUser[] = response.data.map((u: any) => ({
        id: u.id.toString(),
        fullName: u.fullname || u.fullName,
        userName: u.username || u.userName,
        email: u.email,
        phone: u.phone || "",
        password: "",
        active: u.status === "active",
        role: (u.role.charAt(0).toUpperCase() + u.role.slice(1)) as UserRole,
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- Filtered Users ---------------- */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.userName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /* ---------------- Handlers ---------------- */
  const handleToggleStatus = (id: string, active: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active } : u))
    );
  };

  const handleEdit = (user: SystemUser) => {
    console.log("Edit user:", user);
  };

  return (
    <div className="space-y-4">
      {/* -------- Search & Filter -------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name, employee ID, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />

        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as any)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {["Admin", "Supervisor", "KAM", "Management"].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* -------- Table -------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Loading users...
              </TableCell>
            </TableRow>
          )}

          {!loading && filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.userName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>

                {/* -------- Status Toggle -------- */}
                <TableCell>
  <div className="flex items-center gap-2">
    <span
      className={`text-sm font-medium ${
        user.active ? "text-green-600" : "text-red-600"
      }`}
    >
      {user.active ? "Active" : "Inactive"}
    </span>
  </div>
</TableCell>

                {/* -------- Actions -------- */}
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-2"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
