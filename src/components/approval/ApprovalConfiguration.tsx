'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { SelectItem } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, ArrowUp, ArrowDown, Plus, RotateCcw, CheckCircle2 } from 'lucide-react';

import { LabelApi } from '@/api/labelApi';

interface SystemUser {
  id: number;
  fullname: string;
}

interface RuleItem {
  id: string;
  configName: string;
  userId: string;
  userName: string;
  status: 'active' | 'inactive';
}

export function ApprovalConfiguration({ defaultSupervisorId }: { defaultSupervisorId?: string }) {
  const [configName] = useState('Temporary Configuration');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ---------------- Load Users ----------------
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await LabelApi.getSystemUsers();
        const userList: SystemUser[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        setUsers(userList);

        // select default
        if (defaultSupervisorId) {
          setSelectedUser(String(defaultSupervisorId));
        } else if (userList.length > 0) {
          setSelectedUser(String(userList[0].id));
        }
      } catch (error) {
        console.error('Failed to load system users', error);
        setUsers([]);
      }
    };

    loadUsers();
  }, [defaultSupervisorId]);

  const hasRules = rules.length > 0;
  const isAddDisabled = useMemo(() => !selectedUser, [selectedUser]);

  // ---------------- Add Rule ----------------
  const handleAddRule = useCallback(() => {
    if (!selectedUser) return;

    // Allow "Default Supervisor" to be added
    if (selectedUser === '9001') {
      if (rules.some((r) => r.userId === '9001')) {
        return alert('Default Supervisor is already added in this configuration.');
      }

      const newRule: RuleItem = {
        id: uuidv4(),
        configName,
        userId: '9001',
        userName: 'Default Supervisor',
        status,
      };

      setRules((prev) => [...prev, newRule]);
      setSelectedUser('9001');
      return;
    }

    // Existing logic for regular users
    const userObj = users.find((u) => String(u.id) === selectedUser);
    if (!userObj) return;

    if (rules.some((r) => r.userId === selectedUser)) {
      return alert('This user is already added in this configuration.');
    }

    const newRule: RuleItem = {
      id: crypto.randomUUID(),
      configName,
      userId: selectedUser,
      userName: userObj.fullname,
      status,
    };

    setRules((prev) => [...prev, newRule]);
    setSelectedUser(String(users[0]?.id || '9001'));
  }, [selectedUser, users, rules, status, configName]);

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

  // ---------------- Apply & Save ----------------
  const handleApplyAndSave = useCallback(async () => {
    if (!hasRules) return;

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Save each rule to the backend
      const savePromises = rules.map((rule) =>
        LabelApi.createLabel({
          user_id: rule.userId,
          status: rule.status,
        })
      );

      await Promise.all(savePromises);

      setSuccessMessage('All rules have been saved successfully!');

      // Clear rules after successful save
      setTimeout(() => {
        setRules([]);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error saving rules:', error);
      setErrorMessage('Failed to save rules. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [rules, hasRules]);

  return (
    <div className="w-full space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {errorMessage}
        </div>
      )}

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
              {/* Static default option */}
              <SelectItem value="9001">Default Supervisor</SelectItem>

              {/* Dynamic user options */}
              {users.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.fullname}
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
              rules.map((rule, index) => (
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

                      {index > 0 && (
                        <Button variant="ghost" size="icon" onClick={() => moveRule(index, 'up')}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      )}

                      {index < rules.length - 1 && (
                        <Button variant="ghost" size="icon" onClick={() => moveRule(index, 'down')}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setRules([])}
          className="gap-2 text-red-500"
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4" /> Clear
        </Button>

        <Button
          disabled={!hasRules || isLoading}
          onClick={handleApplyAndSave}
          className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Apply & Save'}
        </Button>
      </div>
    </div>
  );
}
