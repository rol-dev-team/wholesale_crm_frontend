"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableIcon } from "lucide-react";
import { formatCurrency } from "@/data/mockData";

const MONTHS_ARRAY = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  sales: any[];
  filteredKams: any[];
  dateRangeType: "monthly" | "yearly";
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
    if (dateRangeType === "monthly") {
      let sYear = parseInt(startYear);
      let eYear = parseInt(endYear);
      let sMonth = MONTHS_ARRAY.indexOf(startMonth);
      let eMonth = MONTHS_ARRAY.indexOf(endMonth);
      let year = sYear;
      let month = sMonth;
      while (year < eYear || (year === eYear && month <= eMonth)) {
        periods.push({
          month, year,
          label: `${MONTHS_ARRAY[month].substring(0, 3)}-${year.toString().slice(-2)}`,
        });
        month++;
        if (month > 11) { month = 0; year++; }
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

  // ---------------- KAM PERFORMANCE DATA + 10 DUMMY DATA ----------------
  const kamPerformanceData = useMemo(() => {
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
            (dateRangeType === "monthly"
              ? d.getMonth() === period.month && d.getFullYear() === period.year
              : d.getFullYear() === period.year)
          );
        });

        const achieved = periodSales.length > 0 
          ? periodSales.reduce((sum, s) => sum + s.salesAmount, 0)
          : Math.floor(Math.random() * 600000); 
        
        const uniqueClientsInPeriod = periodSales.length > 0 
          ? new Set(periodSales.map((s) => s.clientId)).size
          : Math.floor(Math.random() * 8);

        rangeTargetSum += target;
        rangeAchievedSum += achieved;

        return { target, achieved, clientCount: uniqueClientsInPeriod };
      });

      return { ...kam, periodStats, rangeTargetSum, rangeAchievedSum };
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
        {/* 1. OUTER SCROLL CONTAINER: Controls height and vertical scroll */}
        <div className="relative overflow-auto w-full border-t h-[450px]">
          
          {/* 2. TABLE COMPONENT: Passing 'overflow-visible' to containerClassName is vital */}
          <Table 
            className="w-full table-auto border-separate border-spacing-0"
            containerClassName="overflow-visible" 
          >
            <TableHeader className="bg-slate-100 z-40">
              <TableRow>
                {/* STICKY TOP AND LEFT (Corner Cell) */}
                <TableHead
                  rowSpan={2}
                  className="border-r border-b font-bold text-foreground min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60] shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
                >
                  {divisionFilter === "all" ? "KAM Name" : "Division"}
                </TableHead>

                {/* STICKY TOP ONLY */}
                {tablePeriods.map((p) => (
                  <TableHead
                    key={p.label}
                    colSpan={3}
                    className="text-center border-r border-b font-semibold text-foreground min-w-[300px] whitespace-nowrap sticky top-0 bg-slate-100 z-50 shadow-[0_1px_0_rgba(0,0,0,0.1)]"
                  >
                    {p.label}
                  </TableHead>
                ))}

                {/* STICKY TOP AND RIGHT */}
                <TableHead
                  colSpan={2}
                  className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60] border-l shadow-[0_1px_0_rgba(0,0,0,0.1)]"
                >
                  TOTAL
                </TableHead>
              </TableRow>

              <TableRow>
                {/* SECOND HEADER ROW STICKY: top matches Row 1 height (48px) */}
                {tablePeriods.map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[80px] sticky top-[48px] bg-slate-50 z-50 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                      Clients
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[100px] sticky top-[48px] bg-slate-50 z-50 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                      Target
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[100px] sticky top-[48px] bg-slate-50 z-50 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                      Achieve
                    </TableHead>
                  </React.Fragment>
                ))}

                <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider bg-slate-200 font-bold sticky right-[100px] top-[48px] z-[60] border-l shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                  Target
                </TableHead>
                <TableHead className="text-center border-b text-[10px] uppercase tracking-wider bg-slate-200 font-bold sticky right-0 top-[48px] z-[60] shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                  Achieve
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {kamPerformanceData.map((kam) => (
                <TableRow key={kam.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="font-medium border-r border-b py-3 sticky left-0 bg-white z-20 shadow-[1px_0_0_rgba(0,0,0,0.1)] whitespace-nowrap text-foreground">
                    {kam.name}
                  </TableCell>

                  {kam.periodStats.map((stat, i) => (
                    <React.Fragment key={i}>
                      <TableCell className="text-center border-r border-b text-muted-foreground text-sm font-medium bg-white">
                        {stat.clientCount}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-muted-foreground text-sm whitespace-nowrap px-4 bg-white">
                        {formatCurrency(stat.target)}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm whitespace-nowrap px-4 bg-white ${stat.achieved >= stat.target ? "text-emerald-600" : "text-orange-600"}`}>
                        {formatCurrency(stat.achieved)}
                      </TableCell>
                    </React.Fragment>
                  ))}

                  <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm text-slate-700 sticky right-[100px] z-20 border-l shadow-[-1px_0_0_rgba(0,0,0,0.1)] whitespace-nowrap">
                    {formatCurrency(kam.rangeTargetSum)}
                  </TableCell>
                  <TableCell className={`text-center border-b font-bold bg-slate-50 text-sm sticky right-0 z-20 whitespace-nowrap shadow-[-1px_0_0_rgba(0,0,0,0.1)] ${kam.rangeAchievedSum >= kam.rangeTargetSum ? "text-emerald-700" : "text-destructive"}`}>
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

// "use client";

// import React, { useMemo } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table as TableIcon } from "lucide-react";
// import { formatCurrency } from "@/data/mockData";

// const MONTHS_ARRAY = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// interface Props {
//   sales: any[];
//   filteredKams: any[];
//   dateRangeType: "monthly" | "yearly";
//   startMonth: string;
//   endMonth: string;
//   startYear: string;
//   endYear: string;
//   divisionFilter: string;
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   filteredKams,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   divisionFilter,
// }) => {
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];
//     if (dateRangeType === "monthly") {
//       let sYear = parseInt(startYear);
//       let eYear = parseInt(endYear);
//       let sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       let eMonth = MONTHS_ARRAY.indexOf(endMonth);
//       let year = sYear;
//       let month = sMonth;
//       while (year < eYear || (year === eYear && month <= eMonth)) {
//         periods.push({
//           month, year,
//           label: `${MONTHS_ARRAY[month].substring(0, 3)}-${year.toString().slice(-2)}`,
//         });
//         month++;
//         if (month > 11) { month = 0; year++; }
//       }
//     } else {
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       for (let y = sYear; y <= eYear; y++) {
//         periods.push({ year: y, label: `${y}` });
//       }
//     }
//     return periods;
//   }, [dateRangeType, startMonth, endMonth, startYear, endYear]);

//   const kamPerformanceData = useMemo(() => {
//     const dummyKams = Array.from({ length: 15 }).map((_, i) => ({
//       id: `dummy-${i}`,
//       name: `KAM Officer ${i + 1}`,
//     }));
//     const combinedKams = [...filteredKams, ...dummyKams];
//     return combinedKams.map((kam) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;
//       const periodStats = tablePeriods.map((period) => {
//         const target = 500000;
//         const periodSales = sales.filter((s) => {
//           const d = new Date(s.closingDate);
//           return s.kamId === kam.id && (dateRangeType === "monthly" ? d.getMonth() === period.month && d.getFullYear() === period.year : d.getFullYear() === period.year);
//         });
//         const achieved = periodSales.length > 0 ? periodSales.reduce((sum, s) => sum + s.salesAmount, 0) : Math.floor(Math.random() * 600000); 
//         const uniqueClientsInPeriod = periodSales.length > 0 ? new Set(periodSales.map((s) => s.clientId)).size : Math.floor(Math.random() * 10);
//         rangeTargetSum += target;
//         rangeAchievedSum += achieved;
//         return { target, achieved, clientCount: uniqueClientsInPeriod };
//       });
//       return { ...kam, periodStats, rangeTargetSum, rangeAchievedSum };
//     });
//   }, [filteredKams, sales, tablePeriods, dateRangeType]);

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">
//         {/* 1. SCROLLABLE CONTAINER: Must have max-height and overflow-auto */}
//         <div className="relative overflow-auto w-full border-t max-h-[450px]">
//           {/* 2. TABLE CONFIG: border-separate is required for sticky headers */}
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="relative z-40">
//               <TableRow>
//                 {/* 3. FIRST ROW STICKY: top-0 */}
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold text-foreground min-w-[180px] sticky left-0 top-0 bg-slate-100 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
//                 >
//                   {divisionFilter === "all" ? "KAM Name" : "Division"}
//                 </TableHead>

//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={3}
//                     className="text-center border-r border-b font-semibold text-foreground min-w-[300px] whitespace-nowrap sticky top-0 bg-slate-100 z-30"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={2}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {/* 4. SECOND ROW STICKY: top-[45px] (matches first row height) */}
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[80px] whitespace-nowrap sticky top-[45px] bg-slate-50 z-30">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[100px] whitespace-nowrap sticky top-[45px] bg-slate-50 z-30">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider min-w-[100px] whitespace-nowrap sticky top-[45px] bg-slate-50 z-30">
//                       Achieve
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase tracking-wider bg-slate-200 font-bold sticky right-[100px] top-[45px] z-50 border-l w-[100px]">
//                   Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase tracking-wider bg-slate-200 font-bold sticky right-0 top-[45px] z-50 w-[100px]">
//                   Achieve
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20 transition-colors">
//                   <TableCell className="font-medium border-r border-b py-3 sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
//                     {kam.name}
//                   </TableCell>
//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm bg-white">{stat.clientCount}</TableCell>
//                       <TableCell className="text-center border-r border-b text-sm bg-white">{formatCurrency(stat.target)}</TableCell>
//                       <TableCell className={`text-center border-r border-b font-semibold text-sm bg-white ${stat.achieved >= stat.target ? "text-emerald-600" : "text-orange-600"}`}>
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}
//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm sticky right-[100px] z-20 border-l">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell className={`text-center border-b font-bold bg-slate-50 text-sm sticky right-0 z-20 ${kam.rangeAchievedSum >= kam.rangeTargetSum ? "text-emerald-700" : "text-destructive"}`}>
//                     {formatCurrency(kam.rangeAchievedSum)}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };