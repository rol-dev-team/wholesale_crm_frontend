"use client";

import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";

export type UserMappingValues = {
  userId: string;
  groups: string[];
  teams: string[];
  kams: string[];
};

interface MappedListProps {
  mappings: UserMappingValues[];
  systemUsers: { id: string; name: string }[];
  groupOptions: { id: string; label: string }[];
  teamOptions: { id: string; label: string }[];
  onEdit: (mapping: UserMappingValues) => void;
  onDelete: (index: number) => void;
}

export function MappedList({ mappings, systemUsers, groupOptions, teamOptions, onEdit, onDelete }: MappedListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Groups</TableCell>
          <TableCell>Teams</TableCell>
          <TableCell>KAMs</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mappings.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No mappings created yet
            </TableCell>
          </TableRow>
        )}
        {mappings.map((m, idx) => (
          <TableRow key={idx}>
            <TableCell>{systemUsers.find(u => u.id === m.userId)?.name || "Unknown"}</TableCell>
            <TableCell>{m.groups.map(g => groupOptions.find(opt => opt.id === g)?.label).join(", ")}</TableCell>
            <TableCell>{m.teams.map(t => teamOptions.find(opt => opt.id === t)?.label).join(", ")}</TableCell>
            <TableCell>{m.kams.map(k => systemUsers.find(u => u.id === k)?.name).join(", ")}</TableCell>
            <TableCell className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(m)}><Edit className="h-4 w-4" /></Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(idx)}><Trash className="h-4 w-4" /></Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
