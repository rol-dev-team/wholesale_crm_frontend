import { useState } from "react";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelWrapper } from "@/components/ui/floating-label-wrapper";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Group, Settings2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  systemUsers,
  businessEntities,
  divisions,
  initialKAMs,
} from "@/data/mockData";
import type { SystemUser } from "@/data/mockData";

/* ---------------- helpers ---------------- */

const kamUsers = systemUsers.filter((u) => u.role === "kam");
const products = ["Product A", "Product B", "Product C", "Product D"];

/* ================= PAGE ================= */

export default function SettingsPage() {
  /* ---------------- TEAMS ---------------- */
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamBusinesses, setTeamBusinesses] = useState<string[]>([]);
  const [teamKAMs, setTeamKAMs] = useState<string[]>([]);
  const [teamSupervisor, setTeamSupervisor] = useState<string>("");
  const [teams, setTeams] = useState<
    { name: string; businesses: string[]; kams: string[]; supervisor: string }[]
  >([]);

  // Teams dropdowns
  const [teamBusinessDropdownOpen, setTeamBusinessDropdownOpen] = useState(false);
  const [teamKamDropdownOpen, setTeamKamDropdownOpen] = useState(false);
  const [teamSupervisorDropdownOpen, setTeamSupervisorDropdownOpen] = useState(false);

  const handleSaveTeam = () => {
    if (!teamName || !teamSupervisor) {
      toast({ title: "Error", description: "Team name & supervisor required" });
      return;
    }

    setTeams((prev) => [
      ...prev,
      {
        name: teamName,
        businesses: teamBusinesses,
        kams: teamKAMs,
        supervisor: teamSupervisor,
      },
    ]);

    setTeamName("");
    setTeamBusinesses([]);
    setTeamKAMs([]);
    setTeamSupervisor("");
    setShowTeamForm(false);

    toast({ title: "Team Created", description: `Team "${teamName}" has been created` });
  };

  const handleCancelTeam = () => {
    setTeamName("");
    setTeamBusinesses([]);
    setTeamKAMs([]);
    setTeamSupervisor("");
    setShowTeamForm(false);
  };

  const handleEditTeam = (index: number) => {
    const team = teams[index];
    setTeamName(team.name);
    setTeamBusinesses(team.businesses);
    setTeamKAMs(team.kams);
    setTeamSupervisor(team.supervisor);
    setShowTeamForm(true);
    setTeams(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteTeam = (index: number) => {
    setTeams(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Deleted", description: "Team has been deleted" });
  };

  /* ---------------- GROUPS ---------------- */
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupTeams, setGroupTeams] = useState<string[]>([]);
  const [groupKAMs, setGroupKAMs] = useState<string[]>([]);
  const [groupSupervisor, setGroupSupervisor] = useState<string>("");
  const [groups, setGroups] = useState<
    { name: string; teams: string[]; kams: string[]; supervisor: string }[]
  >([]);

  const [groupTeamsDropdownOpen, setGroupTeamsDropdownOpen] = useState(false);
  const [groupKamDropdownOpen, setGroupKamDropdownOpen] = useState(false);
  const [groupSupervisorDropdownOpen, setGroupSupervisorDropdownOpen] = useState(false);

  const handleSaveGroup = () => {
    if (!groupName || !groupSupervisor) {
      toast({ title: "Error", description: "Group name & supervisor required" });
      return;
    }

    setGroups((prev) => [
      ...prev,
      {
        name: groupName,
        teams: groupTeams,
        kams: groupKAMs,
        supervisor: groupSupervisor,
      },
    ]);

    setGroupName("");
    setGroupTeams([]);
    setGroupKAMs([]);
    setGroupSupervisor("");
    setShowGroupForm(false);

    toast({ title: "Group Created", description: `Group "${groupName}" has been created` });
  };

  const handleCancelGroup = () => {
    setGroupName("");
    setGroupTeams([]);
    setGroupKAMs([]);
    setGroupSupervisor("");
    setShowGroupForm(false);
  };

  const handleEditGroup = (index: number) => {
    const group = groups[index];
    setGroupName(group.name);
    setGroupTeams(group.teams);
    setGroupKAMs(group.kams);
    setGroupSupervisor(group.supervisor);
    setShowGroupForm(true);
    setGroups(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteGroup = (index: number) => {
    setGroups(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Deleted", description: "Group has been deleted" });
  };

  /* ---------------- USER CONFIGURATION ---------------- */
  type ConfigRole = "kam" | "supervisor" | "management" | "";
  
  interface UserConfig {
    userId: string;
    businessEntities: string[];
    role: ConfigRole;
    divisions: string[];
    kams: string[];
    products: string[];
  }

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configUserId, setConfigUserId] = useState<string>("");
  const [configBusinessEntities, setConfigBusinessEntities] = useState<string[]>([]);
  const [configRole, setConfigRole] = useState<ConfigRole>("");
  const [configDivisions, setConfigDivisions] = useState<string[]>([]);
  const [configKams, setConfigKams] = useState<string[]>([]);
  const [configProducts, setConfigProducts] = useState<string[]>([]);
  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);

  // Dropdown states for user config
  const [configBusinessDropdownOpen, setConfigBusinessDropdownOpen] = useState(false);
  const [configDivisionDropdownOpen, setConfigDivisionDropdownOpen] = useState(false);
  const [configKamDropdownOpen, setConfigKamDropdownOpen] = useState(false);
  const [configProductDropdownOpen, setConfigProductDropdownOpen] = useState(false);

  const handleSaveConfig = () => {
    if (!configUserId || !configBusinessEntities.length || !configRole) {
      toast({ title: "Error", description: "User, Business Entities, and Role are required" });
      return;
    }

    if (configRole === "supervisor" && !configDivisions.length) {
      toast({ title: "Error", description: "Division is required for Supervisor" });
      return;
    }

    if (configRole === "kam" && (!configDivisions.length || !configProducts.length)) {
      toast({ title: "Error", description: "Division and Products are required for KAM" });
      return;
    }

    setUserConfigs((prev) => [
      ...prev,
      {
        userId: configUserId,
        businessEntities: configBusinessEntities,
        role: configRole,
        divisions: configDivisions,
        kams: configKams,
        products: configProducts,
      },
    ]);

    resetConfigForm();
    toast({ title: "Configuration Saved", description: "User configuration has been saved" });
  };

  const resetConfigForm = () => {
    setConfigUserId("");
    setConfigBusinessEntities([]);
    setConfigRole("");
    setConfigDivisions([]);
    setConfigKams([]);
    setConfigProducts([]);
    setShowConfigForm(false);
  };

  const handleEditConfig = (index: number) => {
    const config = userConfigs[index];
    setConfigUserId(config.userId);
    setConfigBusinessEntities(config.businessEntities);
    setConfigRole(config.role);
    setConfigDivisions(config.divisions);
    setConfigKams(config.kams);
    setConfigProducts(config.products);
    setShowConfigForm(true);
    setUserConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteConfig = (index: number) => {
    setUserConfigs(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Deleted", description: "User configuration has been deleted" });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList>
          <TabsTrigger value="teams" className="gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <Group className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="userConfig" className="gap-2">
            <Settings2 className="h-4 w-4" />
            User Configuration
          </TabsTrigger>
        </TabsList>

        {/* ===================================================== */}
        {/* ===================== TEAMS ========================= */}
        {/* ===================================================== */}

        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-2">
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Create and manage teams with business entities, KAMs, and supervisors
                </CardDescription>
              </div>

              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  showTeamForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => setShowTeamForm((prev) => !prev)}
              >
                {showTeamForm ? "Close Form" : "Create New Team"}
              </button>
            </CardHeader>

            <CardContent className="space-y-6 w-full">
              {showTeamForm && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                  <FloatingLabelInput
                    id="team-name"
                    label="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full"
                  />

                  <FloatingLabelWrapper
                    label="Business Entities"
                    isActive={teamBusinessDropdownOpen || teamBusinesses.length > 0}
                  >
                    <div
                      className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                      onClick={() => setTeamBusinessDropdownOpen(true)}
                    >
                      {teamBusinesses.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs"
                        >
                          {b}
                          <span
                            className="ml-1 cursor-pointer hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamBusinesses(prev => prev.filter(v => v !== b));
                            }}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>

                    {teamBusinessDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {businessEntities.map((b) => (
                            <div
                              key={b}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                teamBusinesses.includes(b) ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() => {
                                setTeamBusinesses(prev =>
                                  prev.includes(b) ? prev : [...prev, b]
                                );
                              }}
                            >
                              {b}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t bg-background flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                            onClick={() => setTeamBusinessDropdownOpen(false)}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <FloatingLabelWrapper
                    label="Assign KAMs"
                    isActive={teamKamDropdownOpen || teamKAMs.length > 0}
                  >
                    <div
                      className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                      onClick={() => setTeamKamDropdownOpen(true)}
                    >
                      {teamKAMs.map((id) => {
                        const kam = kamUsers.find(k => k.id === id);
                        if (!kam) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs"
                          >
                            {kam.name}
                            <span
                              className="ml-1 cursor-pointer hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTeamKAMs(prev => prev.filter(v => v !== id));
                              }}
                            >
                              ×
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    {teamKamDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {kamUsers.map((kam) => (
                            <div
                              key={kam.id}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                teamKAMs.includes(kam.id) ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() => {
                                setTeamKAMs(prev =>
                                  prev.includes(kam.id) ? prev : [...prev, kam.id]
                                );
                              }}
                            >
                              {kam.name}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t bg-background flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                            onClick={() => setTeamKamDropdownOpen(false)}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <FloatingLabelWrapper
                    label="Supervisor"
                    isActive={teamSupervisor !== ""}
                  >
                    <div
                      className="border rounded-md px-2 py-2 min-h-[38px] cursor-pointer"
                      onClick={() => setTeamSupervisorDropdownOpen(true)}
                    >
                      {teamSupervisor ? (
                        systemUsers.find(u => u.id === teamSupervisor)?.name
                      ) : (
                        <span className="text-muted-foreground text-sm">Select supervisor</span>
                      )}
                    </div>

                    {teamSupervisorDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {systemUsers.map((user) => (
                            <div
                              key={user.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => {
                                setTeamSupervisor(user.id);
                                setTeamSupervisorDropdownOpen(false);
                              }}
                            >
                              {user.name} ({user.role})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveTeam}>Save Team</Button>
                    <Button variant="outline" onClick={handleCancelTeam}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border p-2">Team Name</th>
                      <th className="border border-border p-2">Business Entities</th>
                      <th className="border border-border p-2">KAMs</th>
                      <th className="border border-border p-2">Supervisor</th>
                      <th className="border border-border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="border border-border p-2">{team.name}</td>
                        <td className="border border-border p-2">{team.businesses.join(", ")}</td>
                        <td className="border border-border p-2">
                          {team.kams.map((id) => kamUsers.find((k) => k.id === id)?.name).join(", ")}
                        </td>
                        <td className="border border-border p-2">
                          {systemUsers.find((u) => u.id === team.supervisor)?.name}
                        </td>
                        <td className="border border-border p-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditTeam(idx)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTeam(idx)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================================================== */}
        {/* ===================== GROUPS ======================== */}
        {/* ===================================================== */}

        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-2">
                <CardTitle>Group Management</CardTitle>
                <CardDescription>Create and manage groups</CardDescription>
              </div>

              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  showGroupForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => setShowGroupForm((prev) => !prev)}
              >
                {showGroupForm ? "Close Form" : "Create New Group"}
              </button>
            </CardHeader>

            <CardContent className="space-y-6 w-full">
              {showGroupForm && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                  <FloatingLabelInput
                    id="group-name"
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full"
                  />

                  <FloatingLabelWrapper
                    label="Teams"
                    isActive={groupTeamsDropdownOpen || groupTeams.length > 0}
                  >
                    <div
                      className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                      onClick={() => setGroupTeamsDropdownOpen(true)}
                    >
                      {groupTeams.map((teamName) => (
                        <span
                          key={teamName}
                          className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs"
                        >
                          {teamName}
                          <span
                            className="ml-1 cursor-pointer hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGroupTeams(prev => prev.filter(v => v !== teamName));
                            }}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>

                    {groupTeamsDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {teams.map((t) => (
                            <div
                              key={t.name}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                groupTeams.includes(t.name) ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() =>
                                setGroupTeams(prev =>
                                  prev.includes(t.name) ? prev : [...prev, t.name]
                                )
                              }
                            >
                              {t.name}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t bg-background flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                            onClick={() => setGroupTeamsDropdownOpen(false)}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <FloatingLabelWrapper
                    label="Additional KAMs"
                    isActive={groupKamDropdownOpen || groupKAMs.length > 0}
                  >
                    <div
                      className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                      onClick={() => setGroupKamDropdownOpen(true)}
                    >
                      {groupKAMs.map((id) => {
                        const kam = kamUsers.find(k => k.id === id);
                        if (!kam) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs"
                          >
                            {kam.name}
                            <span
                              className="ml-1 cursor-pointer hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupKAMs(prev => prev.filter(v => v !== id));
                              }}
                            >
                              ×
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    {groupKamDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {kamUsers.map((kam) => (
                            <div
                              key={kam.id}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                groupKAMs.includes(kam.id) ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() =>
                                setGroupKAMs(prev =>
                                  prev.includes(kam.id) ? prev : [...prev, kam.id]
                                )
                              }
                            >
                              {kam.name}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t bg-background flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                            onClick={() => setGroupKamDropdownOpen(false)}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <FloatingLabelWrapper
                    label="Supervisor"
                    isActive={groupSupervisor !== ""}
                  >
                    <div
                      className="border rounded-md px-2 py-2 min-h-[38px] cursor-pointer"
                      onClick={() => setGroupSupervisorDropdownOpen(true)}
                    >
                      {groupSupervisor ? (
                        systemUsers.find(u => u.id === groupSupervisor)?.name
                      ) : (
                        <span className="text-muted-foreground text-sm">Select supervisor</span>
                      )}
                    </div>

                    {groupSupervisorDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {systemUsers.map((user) => (
                            <div
                              key={user.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => {
                                setGroupSupervisor(user.id);
                                setGroupSupervisorDropdownOpen(false);
                              }}
                            >
                              {user.name} ({user.role})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveGroup}>Save Group</Button>
                    <Button variant="outline" onClick={handleCancelGroup}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border p-2">Group Name</th>
                      <th className="border border-border p-2">Teams</th>
                      <th className="border border-border p-2">Supervisor</th>
                      <th className="border border-border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="border border-border p-2">{group.name}</td>
                        <td className="border border-border p-2">{group.teams.join(", ")}</td>
                        <td className="border border-border p-2">
                          {systemUsers.find((u) => u.id === group.supervisor)?.name}
                        </td>
                        <td className="border border-border p-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditGroup(idx)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(idx)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================================================== */}
        {/* =============== USER CONFIGURATION ================== */}
        {/* ===================================================== */}

        <TabsContent value="userConfig">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col gap-2">
                <CardTitle>User Configuration</CardTitle>
                <CardDescription>
                  Configure system users as KAM, Supervisor, or Management with role-specific settings
                </CardDescription>
              </div>

              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  showConfigForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => setShowConfigForm((prev) => !prev)}
              >
                {showConfigForm ? "Close Form" : "Configure User"}
              </button>
            </CardHeader>

            <CardContent className="space-y-6 w-full">
              {showConfigForm && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                  {/* Select User */}
                  <FloatingLabelWrapper label="Select User" isActive={configUserId !== ""}>
                    <Select value={configUserId} onValueChange={setConfigUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {systemUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FloatingLabelWrapper>

                  {/* Business Entities Multi-select */}
                  <FloatingLabelWrapper
                    label="Business Entity"
                    isActive={configBusinessDropdownOpen || configBusinessEntities.length > 0}
                  >
                    <div
                      className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                      onClick={() => setConfigBusinessDropdownOpen(true)}
                    >
                      {configBusinessEntities.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs"
                        >
                          {b}
                          <span
                            className="ml-1 cursor-pointer hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfigBusinessEntities(prev => prev.filter(v => v !== b));
                            }}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>

                    {configBusinessDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                        <div className="max-h-48 overflow-auto">
                          {businessEntities.map((b) => (
                            <div
                              key={b}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                configBusinessEntities.includes(b) ? "bg-muted font-medium" : ""
                              }`}
                              onClick={() =>
                                setConfigBusinessEntities(prev =>
                                  prev.includes(b) ? prev : [...prev, b]
                                )
                              }
                            >
                              {b}
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 border-t bg-background flex justify-end">
                          <button
                            type="button"
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                            onClick={() => setConfigBusinessDropdownOpen(false)}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </FloatingLabelWrapper>

                  {/* Select Role */}
                  <FloatingLabelWrapper label="Select Role" isActive={configRole !== ""}>
                    <Select 
                      value={configRole} 
                      onValueChange={(val: ConfigRole) => {
                        setConfigRole(val);
                        // Reset role-specific fields when role changes
                        setConfigDivisions([]);
                        setConfigKams([]);
                        setConfigProducts([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kam">KAM</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </FloatingLabelWrapper>

                  {/* Supervisor-specific fields */}
                  {configRole === "supervisor" && (
                    <>
                      {/* Division Multi-select */}
                      <FloatingLabelWrapper
                        label="Select Division"
                        isActive={configDivisionDropdownOpen || configDivisions.length > 0}
                      >
                        <div
                          className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                          onClick={() => setConfigDivisionDropdownOpen(true)}
                        >
                          {configDivisions.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-xs"
                            >
                              {d}
                              <span
                                className="ml-1 cursor-pointer hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigDivisions(prev => prev.filter(v => v !== d));
                                }}
                              >
                                ×
                              </span>
                            </span>
                          ))}
                        </div>

                        {configDivisionDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                            <div className="max-h-48 overflow-auto">
                              {divisions.map((d) => (
                                <div
                                  key={d}
                                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                    configDivisions.includes(d) ? "bg-muted font-medium" : ""
                                  }`}
                                  onClick={() =>
                                    setConfigDivisions(prev =>
                                      prev.includes(d) ? prev : [...prev, d]
                                    )
                                  }
                                >
                                  {d}
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t bg-background flex justify-end">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                onClick={() => setConfigDivisionDropdownOpen(false)}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </FloatingLabelWrapper>

                      {/* KAM Multi-select with All option */}
                      <FloatingLabelWrapper
                        label="Select KAM"
                        isActive={configKamDropdownOpen || configKams.length > 0}
                      >
                        <div
                          className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                          onClick={() => setConfigKamDropdownOpen(true)}
                        >
                          {configKams.includes("all") ? (
                            <span className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs">
                              All KAMs
                              <span
                                className="ml-1 cursor-pointer hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigKams([]);
                                }}
                              >
                                ×
                              </span>
                            </span>
                          ) : (
                            configKams.map((id) => {
                              const kam = kamUsers.find(k => k.id === id);
                              if (!kam) return null;
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs"
                                >
                                  {kam.name}
                                  <span
                                    className="ml-1 cursor-pointer hover:text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfigKams(prev => prev.filter(v => v !== id));
                                    }}
                                  >
                                    ×
                                  </span>
                                </span>
                              );
                            })
                          )}
                        </div>

                        {configKamDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                            <div className="max-h-48 overflow-auto">
                              <div
                                className={`px-3 py-2 cursor-pointer hover:bg-muted font-medium border-b ${
                                  configKams.includes("all") ? "bg-muted" : ""
                                }`}
                                onClick={() => {
                                  setConfigKams(["all"]);
                                }}
                              >
                                All KAMs
                              </div>
                              {kamUsers.map((kam) => (
                                <div
                                  key={kam.id}
                                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                    configKams.includes(kam.id) ? "bg-muted font-medium" : ""
                                  } ${configKams.includes("all") ? "opacity-50" : ""}`}
                                  onClick={() => {
                                    if (!configKams.includes("all")) {
                                      setConfigKams(prev =>
                                        prev.includes(kam.id) ? prev : [...prev, kam.id]
                                      );
                                    }
                                  }}
                                >
                                  {kam.name}
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t bg-background flex justify-end">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                onClick={() => setConfigKamDropdownOpen(false)}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </FloatingLabelWrapper>
                    </>
                  )}

                  {/* KAM-specific fields */}
                  {configRole === "kam" && (
                    <>
                      {/* Division Multi-select */}
                      <FloatingLabelWrapper
                        label="Division"
                        isActive={configDivisionDropdownOpen || configDivisions.length > 0}
                      >
                        <div
                          className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                          onClick={() => setConfigDivisionDropdownOpen(true)}
                        >
                          {configDivisions.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-xs"
                            >
                              {d}
                              <span
                                className="ml-1 cursor-pointer hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigDivisions(prev => prev.filter(v => v !== d));
                                }}
                              >
                                ×
                              </span>
                            </span>
                          ))}
                        </div>

                        {configDivisionDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                            <div className="max-h-48 overflow-auto">
                              {divisions.map((d) => (
                                <div
                                  key={d}
                                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                    configDivisions.includes(d) ? "bg-muted font-medium" : ""
                                  }`}
                                  onClick={() =>
                                    setConfigDivisions(prev =>
                                      prev.includes(d) ? prev : [...prev, d]
                                    )
                                  }
                                >
                                  {d}
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t bg-background flex justify-end">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                onClick={() => setConfigDivisionDropdownOpen(false)}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </FloatingLabelWrapper>

                      {/* Products Multi-select */}
                      <FloatingLabelWrapper
                        label="Products"
                        isActive={configProductDropdownOpen || configProducts.length > 0}
                      >
                        <div
                          className="flex flex-wrap gap-1 border rounded-md px-2 py-1 min-h-[38px] cursor-pointer"
                          onClick={() => setConfigProductDropdownOpen(true)}
                        >
                          {configProducts.map((p) => (
                            <span
                              key={p}
                              className="inline-flex items-center bg-orange-100 text-orange-800 rounded-full px-2 py-1 text-xs"
                            >
                              {p}
                              <span
                                className="ml-1 cursor-pointer hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigProducts(prev => prev.filter(v => v !== p));
                                }}
                              >
                                ×
                              </span>
                            </span>
                          ))}
                        </div>

                        {configProductDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full border rounded-md bg-background shadow-md">
                            <div className="max-h-48 overflow-auto">
                              {products.map((p) => (
                                <div
                                  key={p}
                                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                                    configProducts.includes(p) ? "bg-muted font-medium" : ""
                                  }`}
                                  onClick={() =>
                                    setConfigProducts(prev =>
                                      prev.includes(p) ? prev : [...prev, p]
                                    )
                                  }
                                >
                                  {p}
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 border-t bg-background flex justify-end">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                onClick={() => setConfigProductDropdownOpen(false)}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </FloatingLabelWrapper>
                    </>
                  )}

                  {/* Save & Cancel */}
                  <div className="flex gap-2">
                    <Button onClick={handleSaveConfig}>Save Configuration</Button>
                    <Button variant="outline" onClick={resetConfigForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* User Configuration Table */}
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border p-2">User</th>
                      <th className="border border-border p-2">Business Entities</th>
                      <th className="border border-border p-2">Role</th>
                      <th className="border border-border p-2">Divisions</th>
                      <th className="border border-border p-2">KAMs / Products</th>
                      <th className="border border-border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userConfigs.map((config, idx) => {
                      const user = systemUsers.find(u => u.id === config.userId);
                      return (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="border border-border p-2">{user?.name || config.userId}</td>
                          <td className="border border-border p-2">{config.businessEntities.join(", ")}</td>
                          <td className="border border-border p-2">
                            <Badge variant="secondary" className="capitalize">{config.role}</Badge>
                          </td>
                          <td className="border border-border p-2">{config.divisions.join(", ") || "-"}</td>
                          <td className="border border-border p-2">
                            {config.role === "supervisor" && (
                              config.kams.includes("all") 
                                ? "All KAMs" 
                                : config.kams.map(id => kamUsers.find(k => k.id === id)?.name).join(", ")
                            )}
                            {config.role === "kam" && config.products.join(", ")}
                            {config.role === "management" && "-"}
                          </td>
                          <td className="border border-border p-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditConfig(idx)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteConfig(idx)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
