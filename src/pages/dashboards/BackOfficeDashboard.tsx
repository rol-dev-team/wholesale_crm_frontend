import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { KAMModal } from '@/components/kam/KAMModal';
import { MonthCalendar, CalendarEvent } from '@/components/ui/month-calendar';
import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { ActivityModal } from '@/components/activities/ActivityModal';
import {
  Inbox,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Eye,
  UserPlus,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  initialLeads,
  initialKAMs,
  initialActivities,
  initialClients,
  formatDate,
  formatDateTime,
  divisions,
  divisionZones,
  type Lead,
  type KAM,
  type Activity,
  type Client,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export default function BackOfficeDashboard() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [kams, setKams] = useState<KAM[]>(initialKAMs);
  const [clients] = useState<Client[]>(initialClients);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateKamModalOpen, setIsCreateKamModalOpen] = useState(false);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [selectedKamId, setSelectedKamId] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Get available zones based on selected division
  const availableZones = selectedDivision && selectedDivision !== 'all' ? divisionZones[selectedDivision] || [] : [];

  // Filter KAMs based on selected division and zone
  const filteredKams = useMemo(() => {
    return kams.filter(kam => {
      const kamDivisions = kam.division.split(', ');
      const kamZones = kam.zone ? kam.zone.split(', ') : [];
      
      const matchesDivision = !selectedDivision || selectedDivision === 'all' || kamDivisions.includes(selectedDivision);
      const matchesZone = !selectedZone || selectedZone === 'all' || kamZones.includes(selectedZone);
      
      return matchesDivision && matchesZone;
    });
  }, [kams, selectedDivision, selectedZone]);

  // Filter leads
  const pendingLeads = useMemo(() =>
    leads.filter(l => l.status === 'pending_review'), [leads]);
  const ongoingLeads = useMemo(() =>
    leads.filter(l => l.status === 'in_progress' && l.createdBy?.startsWith('user-4')), [leads]);

  // KAM Workload
  const kamWorkload = useMemo(() => {
    return kams.map(kam => {
      const activeLeads = leads.filter(l =>
        l.assignedKamId === kam.id && l.status === 'in_progress'
      );
      const totalValue = activeLeads.reduce((sum, l) => sum + l.expectedValue, 0);
      return {
        ...kam,
        activeLeads: activeLeads.length,
        totalValue,
        workloadPercentage: Math.min((activeLeads.length / 10) * 100, 100),
      };
    });
  }, [kams, leads]);

  // My activities (for back office user)
  const myActivities = useMemo(() => {
    return activities.filter(a => a.createdBy === currentUser?.id || a.createdBy === 'user-5');
  }, [activities, currentUser]);

  // Calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return myActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      date: new Date(activity.scheduledAt),
      type: activity.type,
    }));
  }, [myActivities]);

  // Get activities for selected date
  const selectedDateActivities = useMemo(() => {
    if (!selectedDate) return [];
    return myActivities.filter(a => {
      const actDate = new Date(a.scheduledAt);
      return actDate.toDateString() === selectedDate.toDateString();
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [myActivities, selectedDate]);

  const handleCreateActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity-${Date.now()}`,
    };
    setActivities(prev => [...prev, newActivity]);
    toast({ title: 'Activity Created', description: 'New activity has been scheduled.' });
  };

  const handleAssign = () => {
    if (!selectedLead || !selectedKamId) return;
    const kam = kams.find(k => k.id === selectedKamId);
    setLeads(prev =>
      prev.map(lead =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              status: 'in_progress' as const,
              assignedKamId: selectedKamId,
              assignedKamName: kam?.name || null,
              updatedAt: new Date().toISOString(),
            }
          : lead
      )
    );
    toast({
      title: 'Lead Assigned',
      description: `Lead has been assigned to ${kam?.name}.`,
    });
    setIsAssignModalOpen(false);
    setSelectedLead(null);
    setSelectedKamId('');
  };

  const openAssignModal = (lead: Lead) => {
    setSelectedLead(lead);
    // Set default division and zone from lead
    setSelectedDivision(lead.division || '');
    setSelectedZone(lead.area || '');
    setSelectedKamId('');
    setIsAssignModalOpen(true);
  };

  const openDetailModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleCreateKam = (kamData: Omit<KAM, "id">) => {
    const kam: KAM = {
      id: `kam-${Date.now()}`,
      ...kamData,
    };
    setKams(prev => [...prev, kam]);
    toast({
      title: 'KAM Created',
      description: `${kam.name} has been added successfully.`,
    });
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Back Office Dashboard</h1>
        <p className="text-muted-foreground">Manage lead queue and assignments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingLeads.length}</p>
                <p className="text-sm text-muted-foreground">Pending Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ongoingLeads.length}</p>
                <p className="text-sm text-muted-foreground">Ongoing Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Queue - 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Lead Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingLeads.length})
                  </TabsTrigger>
                  <TabsTrigger value="ongoing" className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Ongoing ({ongoingLeads.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lead</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingLeads.map(lead => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <p className="text-sm text-muted-foreground">{lead.title}</p>
                              </div>
                            </TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell>{formatDate(lead.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => openDetailModal(lead)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="default" onClick={() => openAssignModal(lead)}>
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {pendingLeads.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No pending leads
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="ongoing" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lead</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Assigned KAM</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ongoingLeads.map(lead => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <p className="text-sm text-muted-foreground">{lead.title}</p>
                              </div>
                            </TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lead.assignedKamName}</Badge>
                            </TableCell>
                            <TableCell>
                              <LeadStatusBadge status={lead.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                        {ongoingLeads.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No ongoing leads
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* KAM Workload */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              KAM Workload
            </CardTitle>
            <Button size="sm" onClick={() => setIsCreateKamModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add KAM
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kamWorkload.map(kam => (
                <div key={kam.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {kam.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{kam.name}</p>
                      <p className="text-xs text-muted-foreground">{kam.division}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Leads</span>
                      <span className="font-medium">{kam.activeLeads}</span>
                    </div>
                    <Progress value={kam.workloadPercentage} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            My Calendar
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsCreateActivityOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Month Calendar */}
            <div className="xl:col-span-3">
              <MonthCalendar
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                events={calendarEvents}
                onEventClick={(event) => {
                  const activity = myActivities.find(a => a.id === event.id);
                  if (activity) setSelectedActivity(activity);
                }}
                maxEventsPerDay={3}
              />
            </div>

            {/* Upcoming Activities Sidebar */}
            <div className="xl:col-span-1">
              <div className="sticky top-0">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Upcoming Activities</h3>
                </div>
                
                {myActivities.filter(a => !a.completedAt && new Date(a.scheduledAt) >= new Date()).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
                    No upcoming activities
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {myActivities
                      .filter(a => !a.completedAt && new Date(a.scheduledAt) >= new Date())
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .slice(0, 10)
                      .map(activity => {
                        const client = clients.find(c => c.id === activity.clientId);
                        return (
                          <div 
                            key={activity.id} 
                            className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedActivity(activity)}
                          >
                            <p className="font-medium text-sm truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {client?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {format(new Date(activity.scheduledAt), "MMM d")}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(activity.scheduledAt), "h:mm a")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Selected Date Activities */}
                {selectedDate && selectedDateActivities.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      {selectedDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                      {selectedDateActivities.map(activity => (
                        <div 
                          key={activity.id} 
                          className="p-2 rounded-lg bg-primary/10 text-sm cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <p className="font-medium text-xs">{activity.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(activity.scheduledAt), "h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead to KAM</DialogTitle>
            <DialogDescription>
              Select division and zone to filter KAMs, then assign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium">{selectedLead?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedLead?.company}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedLead?.division} / {selectedLead?.area}
              </p>
            </div>
            
            {/* Division Selection */}
            <div className="space-y-2">
              <Label>Division</Label>
              <Select 
                value={selectedDivision} 
                onValueChange={(val) => {
                  setSelectedDivision(val);
                  setSelectedZone('');
                  setSelectedKamId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div} value={div}>{div}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Zone</Label>
                {(selectedDivision && selectedDivision !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setSelectedDivision('all');
                      setSelectedZone('all');
                      setSelectedKamId('');
                    }}
                  >
                    Show All
                  </Button>
                )}
              </div>
              <Select 
                value={selectedZone} 
                onValueChange={(val) => {
                  setSelectedZone(val);
                  setSelectedKamId('');
                }}
                disabled={!selectedDivision || selectedDivision === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedDivision && selectedDivision !== 'all' ? "Select Zone" : "All Zones"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {availableZones.map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* KAM Selection */}
            <div className="space-y-2">
              <Label>Select KAM</Label>
              <Select value={selectedKamId} onValueChange={setSelectedKamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a KAM" />
                </SelectTrigger>
                <SelectContent>
                  {filteredKams.map(kam => {
                    const workload = kamWorkload.find(k => k.id === kam.id);
                    return (
                      <SelectItem key={kam.id} value={kam.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{kam.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {workload?.activeLeads || 0} leads
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                  {filteredKams.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No KAMs found for selected division/zone
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedKamId}>
              Assign Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lead Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedLead.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedLead.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Division</p>
                  <p className="font-medium">{selectedLead.division}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{selectedLead.area}</p>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailModalOpen(false);
              if (selectedLead) openAssignModal(selectedLead);
            }}>
              Assign Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create KAM Modal */}
      <KAMModal
        open={isCreateKamModalOpen}
        onOpenChange={setIsCreateKamModalOpen}
        onSave={handleCreateKam}
      />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
        client={selectedActivity ? clients.find(c => c.id === selectedActivity.clientId) : null}
        onComplete={() => setSelectedActivity(null)}
      />

      {/* Create Activity Modal */}
      <ActivityModal
        open={isCreateActivityOpen}
        onClose={() => setIsCreateActivityOpen(false)}
        onSave={handleCreateActivity}
        clients={clients}
        preselectedDate={selectedDate}
      />
    </div>
  );
}
