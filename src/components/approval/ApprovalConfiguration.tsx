// src/components/approval/ApprovalConfiguration.tsx
'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { SelectItem } from '@/components/ui/select';
import { Trash2, ArrowUp, ArrowDown, Plus, RotateCcw, CheckCircle2 } from 'lucide-react';
import { SystemUser } from '@/components/user/CreateSystemUserForm';

interface RuleItem {
  id: string;
  configName: string;
  userId: string;
  userName: string;
  status: 'active' | 'inactive';
}

export function ApprovalConfiguration({
  users,
  defaultSupervisorId,
}: {
  users: SystemUser[];
  defaultSupervisorId?: string;
}) {
  // ---------------- Internal State ----------------
  const [configName] = useState('Temporary Configuration'); // fixed config name
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [rules, setRules] = useState<RuleItem[]>([]);

  // ---------------- Sync default supervisor ----------------
  useEffect(() => {
    if (defaultSupervisorId) {
      setSelectedUser(defaultSupervisorId);
    } else if (users.length) {
      // auto-select first supervisor if default not provided
      setSelectedUser(users[0].id);
    }
  }, [defaultSupervisorId, users]);

  // ---------------- Derived State ----------------
  const hasRules = rules.length > 0; // ✅ must define before JSX

  // ---------------- Add Rule ----------------
  const handleAddRule = useCallback(() => {
    if (!selectedUser) return;

    const userObj = users.find((u) => u.id === selectedUser);

    const exists = rules.some((r) => r.userId === selectedUser);
    if (exists) return alert('This user is already added in this configuration.');

    const newRule: RuleItem = {
      id: crypto.randomUUID(),
      configName,
      userId: selectedUser,
      userName: userObj?.fullName || 'Unknown User',
      status,
    };

    setRules((prev) => [...prev, newRule]);

    // Reset only user to default supervisor
    setSelectedUser(defaultSupervisorId || users[0]?.id || '');
  }, [selectedUser, status, users, rules, configName, defaultSupervisorId]);

  // ---------------- Delete Rule ----------------
  const handleDelete = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ---------------- Move Rule ----------------
  const moveRule = useCallback((index: number, direction: 'up' | 'down') => {
    setRules((prev) => {
      const arr = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const isAddDisabled = useMemo(() => !selectedUser, [selectedUser]);

  return (
    <div className="w-full space-y-6">
      {/* ---------------- Add Rule Section ---------------- */}
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-8">
            <FloatingSearchSelect
              label="Select User"
              value={selectedUser}
              searchable
              onValueChange={(v) => setSelectedUser(v)}
            >
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.fullName} ({user.role})
                </SelectItem>
              ))}
            </FloatingSearchSelect>
          </div>

          <div className="col-span-2">
            <FloatingSelect
              label="Status"
              value={status}
              onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
            >
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </FloatingSelect>
          </div>

          <div className="col-span-2">
            <Button
              onClick={handleAddRule}
              disabled={isAddDisabled}
              className="w-full h-md bg-blue-600 hover:bg-blue-700 gap-2 rounded-lg shadow-sm"
            >
              <Plus className="w-5 h-4" /> Add Rule
            </Button>
          </div>
        </div>
      </div>

      {/* ---------------- Rules Table ---------------- */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {hasRules && (
          <div className="px-6 py-3 border-b bg-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-bold">Table:</span>
              <span className="ml-2 font-semibold text-gray-500">Sales Approval</span>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-6 py-3 w-[20%] text-left">Label</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 w-[20%] text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
                  No rules added yet.
                </td>
              </tr>
            ) : (
              rules.map((rule, index) => {
                const isFirst = index === 0;
                const isLast = index === rules.length - 1;

                return (
                  <tr key={rule.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-1 font-semibold text-blue-600">{index + 1}</td>

                    <td className="px-6 py-1 font-medium text-slate-800">{rule.userName}</td>

                    <td className="px-6 py-1 w-[20%]">
                      <div className="flex justify-end gap-1 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {!isFirst && (
                          <Button variant="ghost" size="icon" onClick={() => moveRule(index, 'up')}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                        )}

                        {!isLast && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveRule(index, 'down')}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Footer Buttons ---------------- */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => setRules([])} className="gap-2 text-red-500">
          <RotateCcw className="w-4 h-4" /> Clear
        </Button>

        <Button
          disabled={rules.length === 0}
          className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" /> Apply & Save
        </Button>
      </div>
    </div>
  );
}
