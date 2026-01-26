// src/components/tables/KAMPerformanceTable.tsx
'use client';

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as TableIcon } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';

const MONTHS_ARRAY = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Props {
  sales: any[];
  filteredKams: any[];
  dateRangeType: 'monthly' | 'yearly';
  startMonth: string;
  endMonth: string;
  startYear: string;
  endYear: string;
  divisionFilter: string;
}

export const KAMPerformanceTable: React.FC<Props> = ({
  sales,
  filteredKams,
  dateRangeType,
  startMonth,
  endMonth,
  startYear,
  endYear,
  divisionFilter,
}) => {
  // ---------------- PERIODS FOR TABLE ----------------
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];

    if (dateRangeType === 'monthly') {
      const sYear = parseInt(startYear);
      const eYear = parseInt(endYear);
      const sMonth = MONTHS_ARRAY.indexOf(startMonth);
      const eMonth = MONTHS_ARRAY.indexOf(endMonth);

      let year = sYear;
      let month = sMonth;

      while (year < eYear || (year === eYear && month <= eMonth)) {
        periods.push({
          month,
          year,
          label: `${MONTHS_ARRAY[month].substring(0, 3)}-${year.toString().slice(-2)}`,
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
        periods.push({
          year: y,
          label: `${y}`,
        });
      }
    }

    return periods;
  }, [dateRangeType, startMonth, endMonth, startYear, endYear]);

  // ---------------- KAM PERFORMANCE DATA ----------------
  const kamPerformanceData = useMemo(() => {
    // dummy data
    const dummyKams = Array.from({ length: 15 }).map((_, i) => ({
      id: `dummy-${i}`,
      name: `Dummy Officer ${i + 1}`,
    }));

    const combinedKams = [...filteredKams, ...dummyKams];

    return combinedKams.map((kam) => {
      let rangeTargetSum = 0;
      let rangeAchievedSum = 0;

      const periodStats = tablePeriods.map((period) => {
        const target = 500000;

        const periodSales = sales.filter((s) => {
          const d = new Date(s.closingDate);
          return (
            s.kamId === kam.id &&
            (dateRangeType === 'monthly'
              ? d.getMonth() === period.month && d.getFullYear() === period.year
              : d.getFullYear() === period.year)
          );
        });

        const achieved =
          periodSales.length > 0
            ? periodSales.reduce((sum, s) => sum + Number(s.salesAmount || 0), 0)
            : Math.floor(Math.random() * 600000);

        const selfAchieved = Math.floor(achieved * 0.6);
        const transferredAchieved = Math.floor(achieved * 0.4);
        const upDown = achieved - target;

        const uniqueClientsInPeriod =
          periodSales.length > 0
            ? new Set(periodSales.map((s) => s.clientId)).size
            : Math.floor(Math.random() * 8);

        rangeTargetSum += target;
        rangeAchievedSum += achieved;

        return {
          target,
          achieved,
          selfAchieved,
          transferredAchieved,
          upDown,
          clientCount: uniqueClientsInPeriod,
        };
      });

      return {
        ...kam,
        periodStats,
        rangeTargetSum,
        rangeAchievedSum,
      };
    });
  }, [filteredKams, sales, tablePeriods, dateRangeType]);

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-primary" />
          Performance Analysis Matrix
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative overflow-auto w-full border-t h-[450px]">
          <Table className="w-full table-auto border-separate border-spacing-0">
            <TableHeader className="bg-slate-100 z-40">
              <TableRow>
                <TableHead
                  rowSpan={2}
                  className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
                >
                  {divisionFilter === 'all' ? 'KAM Name' : 'Division'}
                </TableHead>

                {tablePeriods.map((p) => (
                  <TableHead
                    key={p.label}
                    colSpan={6}
                    className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
                  >
                    {p.label}
                  </TableHead>
                ))}

                <TableHead
                  colSpan={2}
                  className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
                >
                  TOTAL
                </TableHead>
              </TableRow>

              <TableRow>
                {tablePeriods.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Clients
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Target
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Achieve
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Self Achieve
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Transferred
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Up / Down
                    </TableHead>
                  </React.Fragment>
                ))}

                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[100px] top-[48px]">
                  Target
                </TableHead>
                <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-[48px]">
                  Achieve
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {kamPerformanceData.map((kam) => (
                <TableRow key={kam.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
                    {kam.name}
                  </TableCell>

                  {kam.periodStats.map((stat, i) => (
                    <React.Fragment key={i}>
                      <TableCell className="text-center border-r border-b">
                        {stat.clientCount}
                      </TableCell>
                      <TableCell className="text-center border-r border-b">
                        {formatCurrency(stat.target)}
                      </TableCell>
                      <TableCell
                        className={`text-center border-r border-b font-semibold ${
                          stat.achieved >= stat.target ? 'text-emerald-600' : 'text-orange-600'
                        }`}
                      >
                        {formatCurrency(stat.achieved)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.selfAchieved)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.transferredAchieved)}
                      </TableCell>
                      <TableCell
                        className={`text-center border-r border-b font-semibold ${
                          stat.upDown >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(stat.upDown)}
                      </TableCell>
                    </React.Fragment>
                  ))}

                  <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px]">
                    {formatCurrency(kam.rangeTargetSum)}
                  </TableCell>
                  <TableCell
                    className={`text-center border-b font-bold bg-slate-50 sticky right-0 ${
                      kam.rangeAchievedSum >= kam.rangeTargetSum
                        ? 'text-emerald-700'
                        : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(kam.rangeAchievedSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
