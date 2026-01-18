import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Crosshair, Filter, X } from 'lucide-react';
import {
  initialKAMs,
  formatCurrency,
  divisions,
  systemUsers,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

/* ---------------- Mock Data ---------------- */

const mockTargets = [
  { kamId: 'kam-1', month: 'November 2024', revenueTarget: 500000, revenueAchieved: 420000 },
  { kamId: 'kam-1', month: 'December 2024', revenueTarget: 600000, revenueAchieved: 180000 },
  { kamId: 'kam-1', month: 'January 2025', revenueTarget: 650000, revenueAchieved: 50000 },
  { kamId: 'kam-2', month: 'November 2024', revenueTarget: 400000, revenueAchieved: 380000 },
  { kamId: 'kam-2', month: 'December 2024', revenueTarget: 450000, revenueAchieved: 120000 },
  { kamId: 'kam-2', month: 'January 2025', revenueTarget: 480000, revenueAchieved: 30000 },
  { kamId: 'kam-3', month: 'November 2024', revenueTarget: 350000, revenueAchieved: 400000 },
  { kamId: 'kam-3', month: 'December 2024', revenueTarget: 400000, revenueAchieved: 90000 },
  { kamId: 'kam-3', month: 'January 2025', revenueTarget: 420000, revenueAchieved: 20000 },
];

// Supervisor targets
const mockSupervisorTargets = [
  { supervisorId: 'user-3', month: 'January 2025', revenueTarget: 1500000, revenueAchieved: 800000 },
  { supervisorId: 'user-3', month: 'December 2024', revenueTarget: 1200000, revenueAchieved: 1100000 },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = ['2026', '2025', '2024', '2023'];

export default function TargetsPage() {
  const { currentUser } = useAuth();

  const [kams] = useState(initialKAMs);
  const [targets, setTargets] = useState(mockTargets);
  const [supervisorTargets, setSupervisorTargets] = useState(mockSupervisorTargets);

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetYear, setTargetYear] = useState('2025');
  const [targetMonthName, setTargetMonthName] = useState('January');
  const [targetType, setTargetType] = useState<'kam' | 'supervisor'>('kam');

  // Filter states
  const [filterKam, setFilterKam] = useState('all');
  const [filterSupervisor, setFilterSupervisor] = useState('all');
  const [filterMonthName, setFilterMonthName] = useState('January');
  const [filterYear, setFilterYear] = useState('2025');

  const filterMonth = `${filterMonthName} ${filterYear}`;
  const currentMonth = filterMonth;
  
  // Calculate previous month
  const currentMonthIndex = months.indexOf(filterMonthName);
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const prevYear = currentMonthIndex === 0 ? String(Number(filterYear) - 1) : filterYear;
  const lastMonth = `${months[prevMonthIndex]} ${prevYear}`;

  // Get supervisors from systemUsers
  const supervisors = systemUsers.filter(u => u.role === 'supervisor');

  // Check if user is management (boss or super_admin)
  const isManagement = currentUser?.role === 'boss' || currentUser?.role === 'super_admin';

  /* ---------------- Team KAMs based on role ---------------- */

  const teamKams = useMemo(() => {
    if (currentUser?.role === 'super_admin' || currentUser?.role === 'boss') {
      return kams;
    }
    return kams.filter(k => k.reportingTo === currentUser?.name);
  }, [kams, currentUser]);

  // Get KAMs under a supervisor
  const getKamsUnderSupervisor = (supervisorName: string) => {
    return kams.filter(k => k.reportingTo === supervisorName);
  };

  /* ---------------- Active filters count ---------------- */

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterKam !== 'all') count++;
    if (filterSupervisor !== 'all') count++;
    if (filterMonthName !== 'January' || filterYear !== '2025') count++;
    return count;
  }, [filterKam, filterSupervisor, filterMonthName, filterYear]);

  const clearFilters = () => {
    setFilterKam('all');
    setFilterSupervisor('all');
    setFilterMonthName('January');
    setFilterYear('2025');
  };

  /* ---------------- Filtered KAMs ---------------- */

  const filteredKams = useMemo(() => {
    let result = teamKams;
    
    // Filter by supervisor if selected
    if (filterSupervisor !== 'all') {
      const supervisor = supervisors.find(s => s.id === filterSupervisor);
      if (supervisor) {
        result = result.filter(k => k.reportingTo === supervisor.name);
      }
    }
    
    // Filter by specific KAM
    if (filterKam !== 'all') {
      result = result.filter(k => k.id === filterKam);
    }
    
    return result;
  }, [teamKams, filterKam, filterSupervisor, supervisors]);

  /* ---------------- Summary ---------------- */

  const summaryStats = useMemo(() => {
    const currentMonthTargets = targets.filter(t => {
      const matchesMonth = t.month === currentMonth;
      const matchesKam = filterKam === 'all' || t.kamId === filterKam;
      
      // Filter by supervisor's KAMs
      if (filterSupervisor !== 'all') {
        const supervisor = supervisors.find(s => s.id === filterSupervisor);
        if (supervisor) {
          const supervisorKams = getKamsUnderSupervisor(supervisor.name);
          const supervisorKamIds = supervisorKams.map(k => k.id);
          if (!supervisorKamIds.includes(t.kamId)) return false;
        }
      }
      
      return matchesMonth && matchesKam;
    });

    const totalRevenueTarget = currentMonthTargets.reduce((s, t) => s + t.revenueTarget, 0);
    const totalRevenueAchieved = currentMonthTargets.reduce((s, t) => s + t.revenueAchieved, 0);

    return {
      totalRevenueTarget,
      totalRevenueAchieved,
      revenueProgress: totalRevenueTarget ? Math.round((totalRevenueAchieved / totalRevenueTarget) * 100) : 0,
    };
  }, [targets, currentMonth, filterKam, filterSupervisor, supervisors]);

  /* ---------------- KAM Details ---------------- */

  const kamTargetDetails = useMemo(() => {
    return filteredKams.map(kam => {
      const lastMonthTarget = lastMonth 
        ? targets.find(t => t.kamId === kam.id && t.month === lastMonth)
        : null;
      const currentMonthTarget = targets.find(t => t.kamId === kam.id && t.month === currentMonth);

      return {
        ...kam,
        lastMonth: lastMonthTarget || null,
        currentMonth: currentMonthTarget || null,
      };
    });
  }, [filteredKams, targets, currentMonth, lastMonth]);

  /* ---------------- Supervisor Details (for management) ---------------- */

  const supervisorTargetDetails = useMemo(() => {
    if (!isManagement) return [];
    
    let filteredSupervisors = supervisors;
    if (filterSupervisor !== 'all') {
      filteredSupervisors = supervisors.filter(s => s.id === filterSupervisor);
    }
    
    return filteredSupervisors.map(supervisor => {
      const lastMonthTarget = supervisorTargets.find(t => t.supervisorId === supervisor.id && t.month === lastMonth);
      const currentMonthTarget = supervisorTargets.find(t => t.supervisorId === supervisor.id && t.month === currentMonth);

      return {
        ...supervisor,
        lastMonth: lastMonthTarget || null,
        currentMonth: currentMonthTarget || null,
      };
    });
  }, [isManagement, supervisors, supervisorTargets, currentMonth, lastMonth, filterSupervisor]);

  /* ---------------- Actions ---------------- */

  const handleSetTarget = () => {
    const targetMonth = `${targetMonthName} ${targetYear}`;
    
    if (targetType === 'supervisor') {
      const existingIndex = supervisorTargets.findIndex(
        t => t.supervisorId === selectedSupervisor && t.month === targetMonth
      );

      const updated = [...supervisorTargets];

      if (existingIndex >= 0) {
        updated[existingIndex].revenueTarget = Number(targetAmount);
      } else {
        updated.push({
          supervisorId: selectedSupervisor,
          month: targetMonth,
          revenueTarget: Number(targetAmount),
          revenueAchieved: 0,
        });
      }

      setSupervisorTargets(updated);
    } else {
      const existingIndex = targets.findIndex(
        t => t.kamId === selectedKam && t.month === targetMonth
      );

      const updated = [...targets];

      if (existingIndex >= 0) {
        updated[existingIndex].revenueTarget = Number(targetAmount);
      } else {
        updated.push({
          kamId: selectedKam,
          month: targetMonth,
          revenueTarget: Number(targetAmount),
          revenueAchieved: 0,
        });
      }

      setTargets(updated);
    }

    toast({
      title: 'Target Set',
      description: `Revenue target for ${targetMonth} successfully updated`,
    });

    resetForm();
    setIsTargetModalOpen(false);
  };

  const resetForm = () => {
    setTargetAmount('');
    setSelectedKam('');
    setSelectedSupervisor('');
    setSelectedDivision('');
    setTargetYear('2025');
    setTargetMonthName('January');
    setTargetType('kam');
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Targets</h1>
          <p className="text-muted-foreground">Manage revenue targets</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4">
              <DropdownMenuLabel className="flex items-center justify-between px-0">
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="space-y-4 pt-2">
                {/* Supervisor Filter (for management) */}
                {isManagement && (
                  <div className="space-y-2">
                    <Label className="text-sm">Supervisor</Label>
                    <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Supervisors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Supervisors</SelectItem>
                        {supervisors.map(sup => (
                          <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* KAM Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">KAM</Label>
                  <Select value={filterKam} onValueChange={setFilterKam}>
                    <SelectTrigger>
                      <SelectValue placeholder="All KAMs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All KAMs</SelectItem>
                      {teamKams.map(kam => (
                        <SelectItem key={kam.id} value={kam.id}>{kam.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Year</Label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Month</Label>
                  <Select value={filterMonthName} onValueChange={setFilterMonthName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsTargetModalOpen(true)} className="gap-2">
            <Crosshair className="h-4 w-4" />
            Set Target
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Revenue Target ({currentMonth})</p>
            <p className="text-xl font-bold">{formatCurrency(summaryStats.totalRevenueTarget)}</p>
            <Progress value={summaryStats.revenueProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Revenue Achieved ({currentMonth})</p>
            <p className="text-xl font-bold">{formatCurrency(summaryStats.totalRevenueAchieved)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summaryStats.revenueProgress}% of target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supervisor Targets (for management) */}
      {isManagement && supervisorTargetDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Supervisor Target Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden lg:grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-3">Supervisor</div>
              <div className="col-span-4">{lastMonth || 'Previous Month'}</div>
              <div className="col-span-4">{currentMonth}</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="divide-y">
              {supervisorTargetDetails.map(supervisor => (
                <div key={supervisor.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4">
                  <div className="lg:col-span-3">
                    <p className="font-medium">{supervisor.name}</p>
                    <p className="text-sm text-muted-foreground">{supervisor.division}</p>
                  </div>

                  <div className="lg:col-span-4 text-sm">
                    <p className="lg:hidden text-xs text-muted-foreground mb-1">{lastMonth || 'Previous Month'}</p>
                    {supervisor.lastMonth ? (
                      <>
                        <p>{formatCurrency(supervisor.lastMonth.revenueAchieved)} / {formatCurrency(supervisor.lastMonth.revenueTarget)}</p>
                        <Progress value={(supervisor.lastMonth.revenueAchieved / supervisor.lastMonth.revenueTarget) * 100} className="h-1.5" />
                      </>
                    ) : <span className="text-muted-foreground">No target</span>}
                  </div>

                  <div className="lg:col-span-4 text-sm">
                    <p className="lg:hidden text-xs text-muted-foreground mb-1">{currentMonth}</p>
                    {supervisor.currentMonth ? (
                      <>
                        <p>{formatCurrency(supervisor.currentMonth.revenueAchieved)} / {formatCurrency(supervisor.currentMonth.revenueTarget)}</p>
                        <Progress value={(supervisor.currentMonth.revenueAchieved / supervisor.currentMonth.revenueTarget) * 100} className="h-1.5" />
                      </>
                    ) : <span className="text-muted-foreground">No target</span>}
                  </div>

                  <div className="lg:col-span-1 lg:text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetType('supervisor');
                        setSelectedSupervisor(supervisor.id);
                        setIsTargetModalOpen(true);
                      }}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KAM List View */}
      <Card>
        <CardHeader>
          <CardTitle>KAM Target Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden lg:grid grid-cols-12 gap-4 pb-2 text-sm font-medium text-muted-foreground border-b">
            <div className="col-span-3">KAM</div>
            <div className="col-span-4">{lastMonth || 'Previous Month'}</div>
            <div className="col-span-4">{currentMonth}</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y">
            {kamTargetDetails.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No KAMs found matching the filters
              </div>
            ) : (
              kamTargetDetails.map(kam => (
                <div key={kam.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4">
                  <div className="lg:col-span-3">
                    <p className="font-medium">{kam.name}</p>
                    <p className="text-sm text-muted-foreground">{kam.division}</p>
                  </div>

                  <div className="lg:col-span-4 text-sm">
                    <p className="lg:hidden text-xs text-muted-foreground mb-1">{lastMonth || 'Previous Month'}</p>
                    {kam.lastMonth ? (
                      <>
                        <p>{formatCurrency(kam.lastMonth.revenueAchieved)} / {formatCurrency(kam.lastMonth.revenueTarget)}</p>
                        <Progress value={(kam.lastMonth.revenueAchieved / kam.lastMonth.revenueTarget) * 100} className="h-1.5" />
                      </>
                    ) : <span className="text-muted-foreground">No target</span>}
                  </div>

                  <div className="lg:col-span-4 text-sm">
                    <p className="lg:hidden text-xs text-muted-foreground mb-1">{currentMonth}</p>
                    {kam.currentMonth ? (
                      <>
                        <p>{formatCurrency(kam.currentMonth.revenueAchieved)} / {formatCurrency(kam.currentMonth.revenueTarget)}</p>
                        <Progress value={(kam.currentMonth.revenueAchieved / kam.currentMonth.revenueTarget) * 100} className="h-1.5" />
                      </>
                    ) : <span className="text-muted-foreground">No target</span>}
                  </div>

                  <div className="lg:col-span-1 lg:text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTargetType('kam');
                        setSelectedKam(kam.id);
                        setSelectedDivision(kam.division || '');
                        setIsTargetModalOpen(true);
                      }}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Revenue Target</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={targetMonthName} onValueChange={setTargetMonthName}>
                  <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Type (for management) */}
            {isManagement && (
              <div className="space-y-2">
                <Label>Target For</Label>
                <Select value={targetType} onValueChange={(v) => {
                  setTargetType(v as 'kam' | 'supervisor');
                  setSelectedKam('');
                  setSelectedSupervisor('');
                  setSelectedDivision('');
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kam">KAM</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetType === 'supervisor' ? (
              <div className="space-y-2">
                <Label>Supervisor</Label>
                <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                  <SelectTrigger><SelectValue placeholder="Select Supervisor" /></SelectTrigger>
                  <SelectContent>
                    {supervisors.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                    <SelectContent>
                      {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>KAM</Label>
                  <Select value={selectedKam} onValueChange={setSelectedKam} disabled={!selectedDivision}>
                    <SelectTrigger><SelectValue placeholder="Select KAM" /></SelectTrigger>
                    <SelectContent>
                      {kams.filter(k => k.division === selectedDivision).map(k => (
                        <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Target Amount (৳)</Label>
              <Input
                type="number"
                placeholder="Enter revenue target"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTargetModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSetTarget} 
              disabled={(targetType === 'kam' && !selectedKam) || (targetType === 'supervisor' && !selectedSupervisor) || !targetAmount}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
