// KAMFilterDrawer.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"; 
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { divisions, type KAM } from '@/data/mockData';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { SelectItem } from '@/components/ui/select';

interface KAMFilterDrawerProps {
  division: string;
  setDivision: (val: string) => void;
  kam: string;
  setKam: (val: string) => void;
  kams: KAM[];
  dateRange: 'monthly' | 'yearly';
  setDateRange: (val: 'monthly' | 'yearly') => void;
  startMonth: string; 
  setStartMonth: (val: string) => void;
  endMonth: string;
  setEndMonth: (val: string) => void;
  startYear: string;
  setStartYear: (val: string) => void;
  endYear: string;
  setEndYear: (val: string) => void;
  onFilterChange: () => void;
}

export function KAMFilterDrawer({
  division,
  setDivision,
  kam,
  setKam,
  kams,
  dateRange,
  setDateRange,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  onFilterChange
}: KAMFilterDrawerProps) {

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  const MONTHS_LIST = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // ---------------- BUFFER STATES ----------------
  const [tempDivision, setTempDivision] = useState(division);
  const [tempKam, setTempKam] = useState(kam);
  const [tempDateRange, setTempDateRange] = useState<'monthly'|'yearly'>(dateRange);
  const [tempStartMonth, setTempStartMonth] = useState(startMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear);
  const [tempEndYear, setTempEndYear] = useState(endYear);
  
  // New States
  const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
  const [tempClientType, setTempClientType] = useState<string>("All Client");

  // ---------------- EFFECTS ----------------
  useEffect(() => setTempDivision(division), [division]);
  useEffect(() => setTempKam(kam), [kam]);
  useEffect(() => setTempDateRange(dateRange), [dateRange]);
  useEffect(() => setTempStartMonth(startMonth), [startMonth]);
  useEffect(() => setTempEndMonth(endMonth), [endMonth]);
  useEffect(() => setTempStartYear(startYear), [startYear]);
  useEffect(() => setTempEndYear(endYear), [endYear]);

  // ---------------- HELPERS ----------------
  const getPickerDate = (mName: string, yName: string) => {
    const monthIndex = MONTHS_LIST.indexOf(mName);
    return new Date(parseInt(yName), monthIndex >= 0 ? monthIndex : 0);
  };

  const handleDateChange = (date: Date | null, type: 'start'|'end') => {
    if (!date) return;
    const mName = MONTHS_LIST[date.getMonth()];
    const yName = date.getFullYear().toString();
    if (type === 'start') { setTempStartMonth(mName); setTempStartYear(yName); }
    else { setTempEndMonth(mName); setTempEndYear(yName); }
  };

  const handleApplyFilters = () => {
    setDivision(tempDivision);
    setKam(tempKam);
    setDateRange(tempDateRange);
    setStartMonth(tempStartMonth);
    setEndMonth(tempEndMonth);
    setStartYear(tempStartYear);
    setEndYear(tempEndYear);
    onFilterChange();
  };

  const handleClearFilters = () => {
    setTempDivision('all');
    setTempKam('all');
    setTempClientType("All Client");
    setTempDateRange('monthly');
    setFilterType('kam');
    // Reset to current date defaults if needed, or keep as is
  };

  const displayValue = (val: string) => val === 'all' ? '' : val;

  // Logic to show clear button
  const hasChanges = tempDivision !== 'all' || tempKam !== 'all' || tempClientType !== "All Client";

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-full max-w-sm ml-auto">
        <div className="flex flex-col h-full">
          <DrawerHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <DrawerTitle className="text-xl font-semibold">Filter</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ---------------- TYPE DROPDOWN ---------------- */}
            <FloatingSelect
              label="Type"
              value={filterType}
              onValueChange={(val) => setFilterType(val as 'kam' | 'division')}
            >
              <SelectItem value="kam">KAM</SelectItem>
              <SelectItem value="division">Division</SelectItem>
            </FloatingSelect>

            {/* ---------------- CONDITIONAL DROPDOWNS ---------------- */}
            {filterType === 'kam' ? (
              <>
                <FloatingSelect
                  label="All KAM"
                  value={displayValue(tempKam)}
                  onValueChange={setTempKam}
                >
                  {/* <SelectItem value="all">All KAMs</SelectItem> */}
                  {kams.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </FloatingSelect>

                {/* Client Category Dropdown - Only for KAM Type */}
                <FloatingSelect
                  label="Client Category"
                  value={tempClientType}
                  onValueChange={setTempClientType}
                >
                  <SelectItem value="All Client">All Client</SelectItem>
                  <SelectItem value="Self Client">Self Client</SelectItem>
                  <SelectItem value="Transfared Client">Transferred Client</SelectItem>
                </FloatingSelect>
              </>
            ) : (
              <FloatingSelect
                label="Division"
                value={displayValue(tempDivision)}
                onValueChange={setTempDivision}
              >
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </FloatingSelect>
            )}

            {/* ---------------- VIEW MODE ---------------- */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                View Mode
              </Label>
              <Tabs
                value={tempDateRange}
                onValueChange={v => setTempDateRange(v as 'monthly'|'yearly')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60">
                  <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* ---------------- MONTH/YEAR PICKER ---------------- */}
            {tempDateRange === 'monthly' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">From Month</Label>
                  <DatePicker
                    selected={getPickerDate(tempStartMonth, tempStartYear)}
                    onChange={date => handleDateChange(date, 'start')}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    customInput={
                      <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempStartMonth} {tempStartYear}
                      </Button>
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">To Month</Label>
                  <DatePicker
                    selected={getPickerDate(tempEndMonth, tempEndYear)}
                    onChange={date => handleDateChange(date, 'end')}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    minDate={getPickerDate(tempStartMonth, tempStartYear)}
                    customInput={
                      <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempEndMonth} {tempEndYear}
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  label="From Year"
                  value={tempStartYear}
                  onValueChange={setTempStartYear}
                >
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </FloatingSelect>
                <FloatingSelect
                  label="To Year"
                  value={tempEndYear}
                  onValueChange={setTempEndYear}
                >
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </FloatingSelect>
              </div>
            )}

            {/* Clear Button */}
            {hasChanges && (
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={handleClearFilters}
              >
                <RotateCcw className="h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </div>

          <DrawerFooter className="border-t p-6">
            <DrawerClose asChild>
              <Button
                onClick={handleApplyFilters}
                className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
              >
                Apply Filters
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}