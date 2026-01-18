import { useState } from "react";
import { Plus, Users, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KAMTable } from "@/components/kam/KAMTable";
import { KAMModal } from "@/components/kam/KAMModal";
import { initialKAMs, initialLeads, type KAM, type Lead } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KAMPage() {
  const [kams, setKams] = useState<KAM[]>(initialKAMs);
  const [leads] = useState<Lead[]>(initialLeads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKAM, setEditingKAM] = useState<KAM | null>(null);

  // Calculate workload for each KAM
  const kamWorkload = kams.map((kam) => {
    const kamLeads = leads.filter(
      (lead) => lead.assignedKamId === kam.id && lead.status !== "won" && lead.status !== "lost",
    );
    const totalValue = kamLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);
    const wonLeads = leads.filter((lead) => lead.assignedKamId === kam.id && lead.status === "won");
    const wonValue = wonLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);

    return {
      kam,
      activeLeads: kamLeads.length,
      totalPipeline: totalValue,
      wonLeads: wonLeads.length,
      wonValue,
    };
  });

  const totalActiveLeads = kamWorkload.reduce((sum, k) => sum + k.activeLeads, 0);
  const totalPipelineValue = kamWorkload.reduce((sum, k) => sum + k.totalPipeline, 0);
  const maxLeads = Math.max(...kamWorkload.map((k) => k.activeLeads), 1);

  const handleCreateKAM = (kamData: Omit<KAM, "id">) => {
    const newKAM: KAM = {
      ...kamData,
      id: `kam-${Date.now()}`,
    };
    setKams((prev) => [...prev, newKAM]);
    toast({
      title: "KAM Created",
      description: `${kamData.name} has been added successfully.`,
    });
  };

  const handleEditKAM = (kamData: Omit<KAM, "id">) => {
    if (!editingKAM) return;
    setKams((prev) => prev.map((kam) => (kam.id === editingKAM.id ? { ...kamData, id: editingKAM.id } : kam)));
    setEditingKAM(null);
    toast({
      title: "KAM Updated",
      description: `${kamData.name} has been updated successfully.`,
    });
  };

  const handleDeleteKAM = (kamId: string) => {
    const kam = kams.find((k) => k.id === kamId);
    setKams((prev) => prev.filter((k) => k.id !== kamId));
    toast({
      title: "KAM Deleted",
      description: `${kam?.name} has been removed.`,
    });
  };

  const openEditModal = (kam: KAM) => {
    setEditingKAM(kam);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingKAM(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Key Account Managers</h1>
            <p className="text-sm text-muted-foreground">Manage your KAM team, assignments, and workload</p>
          </div>
        </div>
        {/* <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add KAM
        </Button> */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total KAMs</CardDescription>
            <CardTitle className="text-3xl">{kams.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active account managers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Leads</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              {totalActiveLeads}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Leads in progress across all KAMs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pipeline Value</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-success" />${totalPipelineValue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Combined expected revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* KAM Workload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">KAM Workload Distribution</CardTitle>
          <CardDescription>View active leads and pipeline value per account manager</CardDescription>
        </CardHeader>
        <CardContent>
          {kamWorkload.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No KAMs available. Add a KAM to see workload distribution.
            </p>
          ) : (
            <div className="space-y-4">
              {kamWorkload.map((item) => (
                <div
                  key={item.kam.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{item.kam.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.kam.zone}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.kam.division} • Reports to {item.kam.reportingTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold text-primary">{item.activeLeads}</span>
                      <span className="text-xs text-muted-foreground">Active Leads</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold text-success">${item.totalPipeline.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">Pipeline</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold text-amber-600">{item.wonLeads}</span>
                      <span className="text-xs text-muted-foreground">Won</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-32">
                    <Progress value={(item.activeLeads / maxLeads) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KAM Table */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">All KAMs</h2>
      </div>
      <KAMTable kams={kams} onEdit={openEditModal} onDelete={handleDeleteKAM} />

      <KAMModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSave={editingKAM ? handleEditKAM : handleCreateKAM}
        editingKAM={editingKAM}
      />
    </div>
  );
}
