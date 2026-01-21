// KAMPerformancePage.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
import {
  initialKAMs,
  initialSales,
  formatCurrency,
} from '@/data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MONTHS_ARRAY = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function KAMPerformancePage() {
  const [sales] = useState(initialSales);
  const [selectedKamId, setSelectedKamId] = useState<string | null>(null);

  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [dateRangeType, setDateRangeType] = useState<'monthly' | 'yearly'>('monthly');

  // Range States
  const [startMonth, setStartMonth] = useState("January");
  const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  const hasFilters = divisionFilter !== 'all' || selectedKamId !== null || kamFilter !== 'all';

  const clearFilters = () => {
    setDivisionFilter('all');
    setKamFilter('all');
    setSelectedKamId(null);
    setDateRangeType('monthly');
    setStartMonth("January");
    setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
    setStartYear(new Date().getFullYear().toString());
    setEndYear(new Date().getFullYear().toString());
  };

  // ---------------- FILTERED KAMS ----------------
  const filteredKams = useMemo(() => {
    const baseKams = initialKAMs.filter(kam => {
      if (divisionFilter !== 'all' && kam.division !== divisionFilter) return false;
      if (kamFilter !== 'all' && kam.id !== kamFilter) return false;
      return true;
    });

    if (kamFilter === 'all' && baseKams.length > 0) {
      const dummyExtra = Array.from({ length: 10 }, (_, i) => ({
        ...baseKams[0],
        id: `dummy-${i}`,
        name: `Performance Peer ${i + 1}`,
      }));
      return [...baseKams, ...dummyExtra];
    }

    return baseKams;
  }, [divisionFilter, kamFilter]);

  // ---------------- PERIODS ----------------
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];

    if (dateRangeType === 'monthly') {
      let sYear = parseInt(startYear);
      let eYear = parseInt(endYear);
      let sMonth = MONTHS_ARRAY.indexOf(startMonth);
      let eMonth = MONTHS_ARRAY.indexOf(endMonth);

      let year = sYear;
      let month = sMonth;

      while (year < eYear || (year === eYear && month <= eMonth)) {
        periods.push({
          month,
          year,
          label: `${MONTHS_ARRAY[month].substring(0, 3)}-${year.toString().slice(-2)}`
        });

        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else {
      const sYear = parseInt(startYear);
      const eYear = parseInt(endYear);
      for (let y = sYear; y <= eYear; y++) {
        periods.push({ year: y, label: `${y}` });
      }
    }
    return periods;
  }, [dateRangeType, startMonth, endMonth, startYear, endYear]);

  // ---------------- KAM PERFORMANCE DATA ----------------
  const kamPerformanceData = useMemo(() => {
    return filteredKams.map(kam => {
      let rangeTargetSum = 0;
      let rangeAchievedSum = 0;

      const periodStats = tablePeriods.map(period => {
        const target = 500000;

        const achieved = kam.id.startsWith('dummy')
          ? Math.floor(Math.random() * 600000)
          : sales
            .filter(s => {
              const d = new Date(s.closingDate);
              return s.kamId === kam.id &&
                (dateRangeType === 'monthly'
                  ? d.getMonth() === period.month && d.getFullYear() === period.year
                  : d.getFullYear() === period.year);
            })
            .reduce((sum, s) => sum + s.salesAmount, 0);

        rangeTargetSum += target;
        rangeAchievedSum += achieved;

        return { target, achieved };
      });

      return {
        ...kam,
        periodStats,
        rangeTargetSum,
        rangeAchievedSum
      };
    });
  }, [filteredKams, sales, tablePeriods, dateRangeType]);

  // ---------------- TREND DATA ----------------
  const trendData = useMemo(() => {
    return tablePeriods.map((period, idx) => {
      let totalTarget = 0;
      let totalAchieved = 0;

      kamPerformanceData
        .filter(k => !k.id.startsWith('dummy'))
        .forEach(kam => {
          const stat = kam.periodStats[idx];
          if (stat) {
            totalTarget += stat.target;
            totalAchieved += stat.achieved;
          }
        });

      return { name: period.label, totalTarget, totalAchieved };
    });
  }, [tablePeriods, kamPerformanceData]);

  // ✅ --------- NEW: LABEL FOR TOP PERFORMERS (YOUR REQUIREMENT) ---------
  const topPerformerRangeLabel = useMemo(() => {
    if (dateRangeType === "monthly") {
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
    } else {
      if (startYear === endYear) {
        return `${startYear}`;
      }
      return `${startYear} – ${endYear}`;
    }
  }, [dateRangeType, startMonth, endMonth, startYear, endYear]);
  // ----------------------------------------------------------------------

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of sales targets vs achievements
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}

          <KAMFilterDrawer
            division={divisionFilter}
            setDivision={setDivisionFilter}
            kam={kamFilter}
            setKam={setKamFilter}
            kams={initialKAMs}
            dateRange={dateRangeType}
            setDateRange={setDateRangeType}
            startMonth={startMonth}
            setStartMonth={setStartMonth}
            endMonth={endMonth}
            setEndMonth={setEndMonth}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            onFilterChange={() => setSelectedKamId(null)}
          />
        </div>
      </div>

      {/* TABLE */}
      <KAMPerformanceTable
        sales={sales}
        filteredKams={filteredKams.filter(k => !k.id.startsWith('dummy'))}
        dateRangeType={dateRangeType}
        startMonth={startMonth}
        endMonth={endMonth}
        startYear={startYear}
        endYear={endYear}
        divisionFilter={divisionFilter}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LINE CHART */}
        <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[480px]">
          <CardHeader className="border-b bg-muted/5 shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Total Revenue Flow
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 flex-1">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" />

                  <Line
                    type="monotone"
                    dataKey="totalTarget"
                    name="Total Target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalAchieved"
                    name="Total Achieved"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ✅ TOP PERFORMERS WITH MONTH/YEAR DISPLAY */}
        <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[480px] overflow-hidden">
          <CardHeader className="border-b bg-muted/5 shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Top Performers</span>
              </div>

              {/* 🔥 YOUR NEW REQUIREMENT IMPLEMENTED HERE */}
              <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                {topPerformerRangeLabel}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
            <div className="space-y-3">
              {kamPerformanceData
                .sort((a, b) => b.rangeAchievedSum - a.rangeAchievedSum)
                .map((kam, idx) => (
                  <div
                    key={kam.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedKamId === kam.id
                        ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                        : 'hover:bg-muted/50 border-transparent'
                    }`}
                    onClick={() =>
                      setSelectedKamId(selectedKamId === kam.id ? null : kam.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                          idx === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {kam.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {kam.division}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(kam.rangeAchievedSum)}
                      </p>
                      <p className="text-[9px] font-medium text-emerald-600">
                        {(
                          (kam.rangeAchievedSum / kam.rangeTargetSum) *
                          100
                        ).toFixed(0)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}