
// src/components/user/SystemUserList.tsx

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


interface SystemUserListProps {
  users: SystemUser[];
  onEdit: (user: SystemUser) => void;
}
/* ---------------- Component ---------------- */
export function SystemUserList( {
  users,
  onEdit,
  
}: SystemUserListProps ) {

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  /* ---------------- Fetch Users ---------------- */


const COLS = [
  "20%", // Full Name
  "14%", // User Name
  "22%", // Email
  "12%", // Phone
  "12%", // Role
  "10%", // Status
  "10%", // Actions
];


  /* ---------------- Filtered Users ---------------- */
  const filteredUsers = useMemo(() => {
  const searchValue = search.toLowerCase();

  return users.filter((u) => {
    const fullName = (u.fullName ?? "").toLowerCase();
    const userName = (u.userName ?? "").toLowerCase();
    const email = (u.email ?? "").toLowerCase();

    const matchesSearch =
      fullName.includes(searchValue) ||
      userName.includes(searchValue) ||
      email.includes(searchValue);

    const matchesRole =
      roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });
}, [users, search, roleFilter]);


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
      {/* -------- Table -------- */}
<div className="rounded-md border">

  {/* ===== Sticky Header ===== */}
  <Table className="table-fixed w-full">
  <colgroup>
    {COLS.map((w, i) => (
      <col key={i} style={{ width: w }} />
    ))}
  </colgroup>

  <TableHeader>
    <TableRow className="bg-background">
      <TableHead>Full Name</TableHead>
      <TableHead>User Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Phone</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
</Table>


  {/* ===== Scrollable Body ===== */}
  <div className="max-h-[420px] overflow-y-auto">
  <Table className="table-fixed w-full">
    <colgroup>
      {COLS.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>

    <TableBody>
      {filteredUsers.map((user) => (
        <TableRow key={user.id}>
          <TableCell>{user.fullName}</TableCell>
          <TableCell>{user.userName}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.phone}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell>
            <span
              className={`text-sm font-medium ${
                user.status === "active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {user.status === "active" ? "Active" : "Inactive"}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

</div>
    </div>
  );
}