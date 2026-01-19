"use client";

import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Group, Settings2, Edit2, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { systemUsers as mockSystemUsers } from "@/data/mockData";

import FloatingTeamForm, { TeamPayload, SelectOption } from "@/components/teams/createTeamForm";
import { CreateGroupFormValues, CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { UserAccessForm, UserAccessFormValues } from "@/components/user/UserAccessControl";
import { CreateSystemUserForm, SystemUser } from "@/components/user/CreateSystemUserForm";
import { SystemUserList } from "@/components/user/SystemUserList";
import { UserAccessForm as UserMappingForm, UserAccessFormValues as UserMappingValues } from "@/components/user/UserMapping";
import { MappedList } from "@/components/user/MappedList";


/* ================= PAGE ================= */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("teams");

  /* ---------------- TEAMS ---------------- */
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teams, setTeams] = useState<TeamPayload[]>([]);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);

  /* ---------------- GROUPS ---------------- */
  const [groups, setGroups] = useState<CreateGroupFormValues[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);

  /* ---------------- USER ACCESS ---------------- */
  const [userAccesses, setUserAccesses] = useState<UserAccessFormValues[]>([]);
  const [editingUserAccessIndex, setEditingUserAccessIndex] = useState<number | null>(null);

  /* ---------------- SYSTEM USERS ---------------- */
  const [systemUserList, setSystemUserList] = useState<SystemUser[]>([]);
  const [editingSystemUser, setEditingSystemUser] = useState<SystemUser | null>(null);

  /* ---------------- USER MAPPING ---------------- */
  const [userMappings, setUserMappings] = useState<UserMappingValues[]>([]);
  const [editingUserMappingIndex, setEditingUserMappingIndex] = useState<number | null>(null);

  /* ---------------- OPTIONS ---------------- */
  const kamOptions: SelectOption[] = useMemo(
    () => systemUserList.filter(u => u.role.toLowerCase() === "kam").map(u => ({ label: u.fullName, value: u.id })),
    [systemUserList]
  );

  const supervisorOptions: SelectOption[] = useMemo(
    () => systemUserList.filter(u => u.role.toLowerCase() === "supervisor").map(u => ({ label: u.fullName, value: u.id })),
    [systemUserList]
  );

  const teamOptions: SelectOption[] = useMemo(
    () => teams.map((t, idx) => ({ label: t.name, value: String(idx) })),
    [teams]
  );

  /* ---------------- USER ACCESS FORM OPTIONS ---------------- */
  const userAccessGroupOptions = useMemo(
    () => groups.map((g, idx) => ({
      id: String(idx),
      label: g.groupName,
      teams: g.teams.map((tId) => {
        const team = teams[parseInt(tId)];
        return {
          id: tId,
          label: team?.name || "",
          kams: team?.kams.map(kId => {
            const user = systemUserList.find(u => u.id === kId);
            return { label: user?.fullName || "", value: kId };
          }) || [],
        };
      }),
    })),
    [groups, teams, systemUserList]
  );

  const userAccessTeamOptions = useMemo(
    () => teams.map((t, idx) => ({
      id: String(idx),
      label: t.name,
      kams: t.kams.map(kId => {
        const user = systemUserList.find(u => u.id === kId);
        return { label: user?.fullName || "", value: kId };
      }),
    })),
    [teams, systemUserList]
  );

  const userAccessKamOptions = useMemo(
    () => systemUserList.filter(u => u.role.toLowerCase() === "kam").map(u => ({ label: u.fullName, value: u.id })),
    [systemUserList]
  );

  /* ---------------- USER MAPPING OPTIONS ---------------- */
  const userMappingGroupOptions = userAccessGroupOptions;
  const userMappingTeamOptions = userAccessTeamOptions;
  const userMappingKamOptions = userAccessKamOptions;

  /* ---------------- HANDLERS ---------------- */

  // Teams
  const handleSaveTeam = (team: TeamPayload, index?: number) => {
    if (index !== undefined && index !== null) {
      setTeams(prev => prev.map((t, i) => (i === index ? team : t)));
      toast({ title: "Team Updated", description: `Team "${team.name}" updated` });
    } else {
      setTeams(prev => [...prev, team]);
      toast({ title: "Team Created", description: `Team "${team.name}" created` });
    }
    setShowTeamForm(false);
    setEditingTeamIndex(null);
  };

  const handleDeleteTeam = (index: number) => {
    setTeams(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Team Deleted", description: "Team deleted successfully" });
  };

  // Groups
  const handleCreateOrUpdateGroup = (group: CreateGroupFormValues, index?: number) => {
    if (index !== undefined) {
      setGroups(prev => prev.map((g, i) => (i === index ? group : g)));
      toast({ title: "Group Updated", description: `Group "${group.groupName}" updated` });
    } else {
      setGroups(prev => [...prev, group]);
      toast({ title: "Group Created", description: `Group "${group.groupName}" created` });
    }
    setShowGroupForm(false);
    setEditingGroupIndex(null);
  };

  // User Access
  const handleSaveUserAccess = (data: UserAccessFormValues) => {
    if (editingUserAccessIndex !== null) {
      setUserAccesses(prev => prev.map((ua, idx) => idx === editingUserAccessIndex ? data : ua));
      toast({ title: "User Access Updated", description: "Access for user updated." });
    } else {
      setUserAccesses(prev => [...prev, data]);
      toast({ title: "User Access Saved", description: "Access for user saved." });
    }
    setEditingUserAccessIndex(null);
  };

  const handleEditUserAccess = (index: number) => {
    setEditingUserAccessIndex(index);
    setActiveTab("userConfig");
  };

  const handleDeleteUserAccess = (index: number) => {
    setUserAccesses(prev => prev.filter((_, i) => i !== index));
    toast({ title: "User Access Deleted", description: "User access deleted." });
  };

  // System Users
  const handleSaveSystemUser = (user: SystemUser) => {
    if (editingSystemUser) {
      setSystemUserList(prev => prev.map(u => u.id === editingSystemUser.id ? { ...u, ...user } : u));
      toast({ title: "User Updated", description: "System user updated successfully." });
    } else {
      setSystemUserList(prev => [...prev, { ...user, id: crypto.randomUUID() }]);
      toast({ title: "User Created", description: "System user created successfully." });
    }
    setEditingSystemUser(null);
  };

  const handleEditSystemUser = (user: SystemUser) => {
    setEditingSystemUser(user);
    setActiveTab("createSystemUser");
  };

  const handleDeleteSystemUser = (id: string) => {
    setSystemUserList(prev => prev.filter(u => u.id !== id));
    toast({ title: "User Deleted", description: "System user deleted successfully." });
  };

  const handleToggleStatus = (id: string, active: boolean) => {
    setSystemUserList(prev => prev.map(u => u.id === id ? { ...u, active } : u));
  };

  // User Mapping
  const handleSaveUserMapping = (data: UserMappingValues) => {
    if (editingUserMappingIndex !== null) {
      setUserMappings(prev => prev.map((m, idx) => idx === editingUserMappingIndex ? data : m));
      toast({ title: "User Mapping Updated", description: "Mapping updated successfully." });
    } else {
      setUserMappings(prev => [...prev, data]);
      toast({ title: "User Mapping Saved", description: "Mapping saved successfully." });
    }
    setEditingUserMappingIndex(null);
  };

  const handleEditUserMapping = (index: number) => {
    setEditingUserMappingIndex(index);
    setActiveTab("userMapping");
  };

  const handleDeleteUserMapping = (index: number) => {
    setUserMappings(prev => prev.filter((_, idx) => idx !== index));
    toast({ title: "Mapping Deleted", description: "Mapping deleted successfully." });
  };

  /* ---------------- PAGE JSX ---------------- */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="teams" className="gap-2"><Users className="h-4 w-4" /> Teams</TabsTrigger>
          <TabsTrigger value="groups" className="gap-2"><Group className="h-4 w-4" /> Groups</TabsTrigger>
          <TabsTrigger value="createSystemUser" className="gap-2"><Users className="h-4 w-4" /> Create System User</TabsTrigger>
          <TabsTrigger value="systemUserList" className="gap-2"><Users className="h-4 w-4" /> User List</TabsTrigger>
          <TabsTrigger value="userMapping" className="gap-2"><Settings2 className="h-4 w-4" /> User Mapping</TabsTrigger>
          <TabsTrigger value="mappedList" className="gap-2"><Users className="h-4 w-4" /> Mapped Users</TabsTrigger>
        </TabsList>

        {/* TEAMS TAB */}
        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Manage teams</CardDescription>
              </div>
              <Button onClick={() => setShowTeamForm(p => !p)} variant={showTeamForm ? "destructive" : "default"}>
                {showTeamForm ? "Close Form" : "Create Team"}
              </Button>
            </CardHeader>
            <CardContent>
              {showTeamForm && (
                <FloatingTeamForm
                  kamOptions={kamOptions}
                  supervisorOptions={supervisorOptions}
                  onSave={handleSaveTeam}
                  onCancel={() => { setShowTeamForm(false); setEditingTeamIndex(null); }}
                  initialValues={editingTeamIndex !== null ? teams[editingTeamIndex] : undefined}
                  index={editingTeamIndex ?? undefined}
                />
              )}
              {/* Teams Table */}
              <table className="w-full border border-border text-sm mt-4">
                <thead className="bg-muted"><tr><th>Name</th><th>KAMs</th><th>Supervisors</th><th>Actions</th></tr></thead>
                <tbody>
                  {teams.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted-foreground p-4">No teams created yet</td></tr>
                  ) : teams.map((t,i) => (
                    <tr key={i}>
                      <td className="border p-2 font-medium">{t.name}</td>
                      <td className="border p-2">{t.kams.map(id => systemUserList.find(u=>u.id===id)?.fullName).join(", ")}</td>
                      <td className="border p-2">{t.supervisors.map(id => systemUserList.find(u=>u.id===id)?.fullName).join(", ")}</td>
                      <td className="border p-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={()=>{ setEditingTeamIndex(i); setShowTeamForm(true); }}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={()=>handleDeleteTeam(i)}><Trash className="h-4 w-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GROUPS TAB */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Groups</CardTitle>
                <CardDescription>Manage groups</CardDescription>
              </div>
              <Button onClick={()=>{ setShowGroupForm(p=>!p); setEditingGroupIndex(null); }} variant={showGroupForm ? "destructive" : "default"}>
                {showGroupForm ? "Close Form" : "Create Group"}
              </Button>
            </CardHeader>
            <CardContent>
              {showGroupForm && (
                <CreateGroupForm
                  teamOptions={teamOptions}
                  supervisorOptions={supervisorOptions}
                  onSave={handleCreateOrUpdateGroup}
                  initialValues={editingGroupIndex!==null ? groups[editingGroupIndex] : undefined}
                  index={editingGroupIndex ?? undefined}
                />
              )}
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups created yet</p>
              ) : groups.map((g,i)=>(
                <div key={i} className="border p-3 rounded-md flex justify-between">
                  <div>
                    <div className="font-semibold">{g.groupName}</div>
                    <div><span className="font-medium">Teams:</span> {g.teams.map(t=>teamOptions.find(opt=>opt.value===t)?.label).join(", ")}</div>
                    <div><span className="font-medium">Supervisors:</span> {g.supervisors.map(s=>supervisorOptions.find(opt=>opt.value===s)?.label).join(", ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>{ setEditingGroupIndex(i); setShowGroupForm(true); }}><Edit2 className="h-4 w-4"/></Button>
                    <Button size="sm" variant="destructive" onClick={()=>handleCreateOrUpdateGroup({...g, groupName:"DELETE"}, i)}><Trash className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER ACCESS TAB */}
        <TabsContent value="userConfig">
          <Card>
            <CardHeader><CardTitle>User Access</CardTitle></CardHeader>
            <CardContent>
              <UserAccessForm
                groupOptions={userAccessGroupOptions}
                teamOptions={userAccessTeamOptions}
                kamOptions={userAccessKamOptions}
                onSave={handleSaveUserAccess}
                initialValues={editingUserAccessIndex!==null ? userAccesses[editingUserAccessIndex] : undefined}
              />
              {/* Table */}
              <table className="w-full border border-border text-sm mt-4">
                <thead className="bg-muted"><tr><th>User</th><th>Groups</th><th>Teams</th><th>KAMs</th><th>Actions</th></tr></thead>
                <tbody>
                  {userAccesses.length===0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No access configured yet</td></tr>
                  ) : userAccesses.map((ua,i)=>(
                    <tr key={i}>
                      <td className="border p-2">{systemUserList.find(u=>u.id===ua.userId)?.fullName}</td>
                      <td className="border p-2">{ua.groups.map(gId=>userAccessGroupOptions.find(g=>g.id===gId)?.label).join(", ")}</td>
                      <td className="border p-2">{ua.teams.map(tId=>userAccessTeamOptions.find(t=>t.id===tId)?.label).join(", ")}</td>
                      <td className="border p-2">{ua.kams.map(kId=>systemUserList.find(u=>u.id===kId)?.fullName).join(", ")}</td>
                      <td className="border p-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={()=>handleEditUserAccess(i)}><Edit2 className="h-4 w-4"/></Button>
                        <Button size="sm" variant="destructive" onClick={()=>handleDeleteUserAccess(i)}><Trash className="h-4 w-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE SYSTEM USER TAB */}
        <TabsContent value="createSystemUser">
          <Card>
            <CardHeader><CardTitle>Create System User</CardTitle></CardHeader>
            <CardContent>
              <CreateSystemUserForm
                initialValues={editingSystemUser ?? undefined}
                editingUserId={editingSystemUser?.id ?? null}
                onSave={handleSaveSystemUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM USER LIST TAB */}
        <TabsContent value="systemUserList">
          <Card>
            <CardHeader><CardTitle>System Users</CardTitle></CardHeader>
            <CardContent>
              <SystemUserList
                users={systemUserList}
                onEdit={handleEditSystemUser}
                onDelete={handleDeleteSystemUser}
                onToggleStatus={handleToggleStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER MAPPING TAB */}
                  <TabsContent value="userMapping">
            <Card>
              <CardHeader><CardTitle>User Mapping</CardTitle></CardHeader>
              <CardContent>
                <UserMappingForm
                  groupOptions={userMappingGroupOptions}
                  teamOptions={userMappingTeamOptions}
                  kamOptions={userMappingKamOptions}
                  onSave={handleSaveUserMapping}
                  initialValues={editingUserMappingIndex !== null ? userMappings[editingUserMappingIndex] : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>


        {/* MAPPED LIST TAB */}
                    <TabsContent value="mappedList">
              <Card>
                <CardHeader><CardTitle>Mapped Users</CardTitle></CardHeader>
                <CardContent>
                  <MappedList
                    mappings={userMappings}
                    systemUsers={systemUserList}
                    groupOptions={userMappingGroupOptions.map(g => ({ id: g.id, label: g.label }))}
                    teamOptions={userMappingTeamOptions.map(t => ({ id: t.id, label: t.label }))}
                    onEdit={(mapping) => {
                      const index = userMappings.findIndex(m => m.userId === mapping.userId);
                      setEditingUserMappingIndex(index);
                      setActiveTab("userMapping");
                    }}
                    onDelete={(index) => handleDeleteUserMapping(index)}
                  />
                </CardContent>
              </Card>
            </TabsContent>


      </Tabs>
    </div>
  );
}
