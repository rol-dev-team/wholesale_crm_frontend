// src/components/ui/MonthQuarterPicker.tsx
'use client';

import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthQuarterPickerProps {
  valueMonth?: { month: string; year: string };
  valueQuarter?: { quarter: number; year: string };
  onChangeMonth: (month: string, year: string) => void;
  onChangeQuarter: (quarter: number, year: string) => void;
}

export const MonthQuarterPicker: React.FC<MonthQuarterPickerProps> = ({
  valueMonth,
  valueQuarter,
  onChangeMonth,
  onChangeQuarter,
}) => {
  const [mode, setMode] = useState<'month' | 'quarter'>('month');

  // ---------------- Month Picker ----------------
  const selectedMonthDate = valueMonth
    ? new Date(Number(valueMonth.year), MONTHS.indexOf(valueMonth.month))
    : null;

  // ---------------- Quarter Picker ----------------
  const selectedQuarterDate = valueQuarter
    ? new Date(Number(valueQuarter.year), (valueQuarter.quarter - 1) * 3)
    : null;

  // ---------------- Custom Quarter Render ----------------
  const renderQuarterContent = (quarter: number, shortQuarter: string) => {
    return <span>{shortQuarter}</span>;
  };

  return (
    <div className="space-y-2">
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-2">
        <Button
          size="sm"
          variant={mode === 'month' ? 'default' : 'outline'}
          onClick={() => setMode('month')}
          className="flex-1"
        >
          Month
        </Button>
        <Button
          size="sm"
          variant={mode === 'quarter' ? 'default' : 'outline'}
          onClick={() => setMode('quarter')}
          className="flex-1"
        >
          Quarter
        </Button>
      </div>

      {/* DatePicker */}
      {mode === 'month' ? (
        <DatePicker
          selected={selectedMonthDate || undefined}
          onChange={(d: Date | null) => {
            if (!d) return;
            onChangeMonth(MONTHS[d.getMonth()], d.getFullYear().toString());
          }}
          showMonthYearPicker
          dateFormat="MMMM yyyy"
          customInput={<FloatingDatePickerInput label="Month & Year" />}
        />
      ) : (
        <DatePicker
          selected={selectedQuarterDate || undefined}
          onChange={(d: Date | null) => {
            if (!d) return;
            const quarter = Math.floor(d.getMonth() / 3) + 1;
            onChangeQuarter(quarter, d.getFullYear().toString());
          }}
          showQuarterYearPicker
          dateFormat="yyyy, QQQ"
          renderQuarterContent={renderQuarterContent}
          customInput={<FloatingDatePickerInput label="Quarter & Year" />}
        />
      )}
    </div>
  );
};
