// // src/components/tables/KAMPerformanceTable.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table as TableIcon } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   sales: any[];
//   dateRangeType: 'monthly' | 'yearly';
//   startMonth: string;
//   endMonth: string;
//   startYear: string;
//   endYear: string;
//   tablePeriods: any[];
//   loading?: boolean;
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   tablePeriods,
//   loading = false,
// }) => {
//   // Process data by KAM and period
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     // Group all sales by current_supervisor
//     sales.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           id: kamName,
//           name: kamName,
//           periodData: {},
//         };
//       }

//       // Create period key matching tablePeriods format (e.g., "December 2025")
//       let periodKey: string;

//       if (dateRangeType === 'monthly') {
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;
//       } else {
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[kamName].periodData[periodKey]) {
//         kamMap[kamName].periodData[periodKey] = {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           transferredAchieved: 0,
//           selfUpDown: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };
//       }

//       // Accumulate data from backend
//       kamMap[kamName].periodData[periodKey].clientCount +=
//         Number(row.total_client_count || 0);
//       kamMap[kamName].periodData[periodKey].achieved +=
//         Number(row.total_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].selfAchieved +=
//         Number(row.self_client_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].selfUpDown +=
//         Number(row.self_up_down_voucher || 0);
//       kamMap[kamName].periodData[periodKey].transferredAchieved +=
//         Number(row.transferred_client_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].transferredUpDown +=
//         Number(row.transfer_up_down_voucher || 0);
//       kamMap[kamName].periodData[periodKey].targetAmount +=
//         Number(row.target_amount || 0);
//     });

//     // Convert to array with ordered periods
//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           selfUpDown: 0,
//           transferredAchieved: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };

//         const target = stat.targetAmount;
//         const upDown = stat.achieved - target;

//         rangeTargetSum += target;
//         rangeAchievedSum += stat.achieved;

//         return {
//           target,
//           achieved: stat.achieved,
//           selfAchieved: stat.selfAchieved,
//           selfUpDown: stat.selfUpDown,
//           transferredAchieved: stat.transferredAchieved,
//           transferredUpDown: stat.transferredUpDown,
//           targetAmount: stat.targetAmount,
//           clientCount: stat.clientCount,
//           upDown,
//         };
//       });

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType]);

//   if (loading) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           Loading data...
//         </CardContent>
//       </Card>
//     );
//   }

//   if (sales.length === 0) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           No data available for the selected period
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="relative overflow-auto w-full border-t h-[450px]">
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="bg-slate-100 z-40">
//               <TableRow>
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
//                 >
//                   KAM Name
//                 </TableHead>

//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={7}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={2}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Self Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Self)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Transferred
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Transferred)
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[100px] top-[48px]">
//                   Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-[48px]">
//                   Achieve
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.achieved >= stat.targetAmount
//                             ? 'text-emerald-600'
//                             : 'text-orange-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.selfUpDown >= 0
//                             ? 'text-emerald-600'
//                             : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.transferredUpDown >= 0
//                             ? 'text-emerald-600'
//                             : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px] text-sm">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
//                       kam.rangeAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
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

// // src/components/tables/KAMPerformanceTable.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table as TableIcon } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   sales: any[];
//   dateRangeType: 'monthly' | 'yearly';
//   startMonth: string;
//   endMonth: string;
//   startYear: string;
//   endYear: string;
//   tablePeriods: any[];
//   loading?: boolean;
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   tablePeriods,
//   loading = false,
// }) => {
//   // Process data by KAM and period
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     // Group all sales by current_supervisor
//     sales.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           id: kamName,
//           name: kamName,
//           periodData: {},
//         };
//       }

//       // Create period key matching tablePeriods format (e.g., "December 2025")
//       let periodKey: string;

//       if (dateRangeType === 'monthly') {
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;
//       } else {
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[kamName].periodData[periodKey]) {
//         kamMap[kamName].periodData[periodKey] = {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           transferredAchieved: 0,
//           selfUpDown: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };
//       }

//       // Accumulate data from backend
//       kamMap[kamName].periodData[periodKey].clientCount += Number(row.total_client_count || 0);
//       kamMap[kamName].periodData[periodKey].achieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].selfAchieved += Number(
//         row.self_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].selfUpDown += Number(row.self_up_down_voucher || 0);
//       kamMap[kamName].periodData[periodKey].transferredAchieved += Number(
//         row.transferred_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].transferredUpDown += Number(
//         row.transfer_up_down_voucher || 0
//       );
//       kamMap[kamName].periodData[periodKey].targetAmount += Number(row.target_amount || 0);
//     });

//     // Convert to array with ordered periods
//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           selfUpDown: 0,
//           transferredAchieved: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };

//         const target = stat.targetAmount;
//         const upDown = stat.achieved - target;

//         rangeTargetSum += target;
//         rangeAchievedSum += stat.achieved;

//         return {
//           target,
//           achieved: stat.achieved,
//           selfAchieved: stat.selfAchieved,
//           selfUpDown: stat.selfUpDown,
//           transferredAchieved: stat.transferredAchieved,
//           transferredUpDown: stat.transferredUpDown,
//           targetAmount: stat.targetAmount,
//           clientCount: stat.clientCount,
//           upDown,
//         };
//       });

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType]);

//   if (loading) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">Loading data...</CardContent>
//       </Card>
//     );
//   }

//   if (sales.length === 0) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           No data available for the selected period
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="relative overflow-auto w-full border-t h-[450px]">
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="bg-slate-100 z-40">
//               <TableRow>
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
//                 >
//                   KAM Name
//                 </TableHead>

//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={7}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={2}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Self Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Self)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Transferred
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Transferred)
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[100px] top-[48px]">
//                   Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-[48px]">
//                   Achieve
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.achieved >= stat.targetAmount
//                             ? 'text-emerald-600'
//                             : 'text-orange-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px] text-sm">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
//                       kam.rangeAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
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

// // src/components/tables/KAMPerformanceTable.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table as TableIcon } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   sales: any[];
//   dateRangeType: 'monthly' | 'yearly' | 'quarterly';
//   startMonth?: string;
//   endMonth?: string;
//   startYear: string;
//   endYear: string;
//   quarter?: number;
//   quarterYear?: string;
//   tablePeriods: any[];
//   loading?: boolean;
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   quarter,
//   quarterYear,
//   tablePeriods,
//   loading = false,
// }) => {
//   // Process data by KAM and period
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     // Group all sales by current_supervisor
//     sales.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           id: kamName,
//           name: kamName,
//           periodData: {},
//         };
//       }

//       // ✅ Create period key matching tablePeriods format based on view mode
//       let periodKey: string;

//       if (dateRangeType === 'monthly') {
//         // ✅ MONTHLY: Use month and year
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;

//       } else if (dateRangeType === 'quarterly') {
//         // ✅ QUARTERLY: Use quarter and year
//         periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;

//       } else {
//         // ✅ YEARLY: Use year only
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[kamName].periodData[periodKey]) {
//         kamMap[kamName].periodData[periodKey] = {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           transferredAchieved: 0,
//           selfUpDown: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };
//       }

//       // Accumulate data from backend
//       kamMap[kamName].periodData[periodKey].clientCount += Number(row.total_client_count || 0);
//       kamMap[kamName].periodData[periodKey].achieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].selfAchieved += Number(
//         row.self_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].selfUpDown += Number(row.self_up_down_voucher || 0);
//       kamMap[kamName].periodData[periodKey].transferredAchieved += Number(
//         row.transferred_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].transferredUpDown += Number(
//         row.transfer_up_down_voucher || 0
//       );
//       kamMap[kamName].periodData[periodKey].targetAmount += Number(row.target_amount || 0);
//     });

//     // Convert to array with ordered periods
//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           selfUpDown: 0,
//           transferredAchieved: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };

//         const target = stat.targetAmount;
//         const upDown = stat.achieved - target;

//         rangeTargetSum += target;
//         rangeAchievedSum += stat.achieved;

//         return {
//           target,
//           achieved: stat.achieved,
//           selfAchieved: stat.selfAchieved,
//           selfUpDown: stat.selfUpDown,
//           transferredAchieved: stat.transferredAchieved,
//           transferredUpDown: stat.transferredUpDown,
//           targetAmount: stat.targetAmount,
//           clientCount: stat.clientCount,
//           upDown,
//         };
//       });

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType]);

//   if (loading) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">Loading data...</CardContent>
//       </Card>
//     );
//   }

//   if (sales.length === 0) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           No data available for the selected period
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="relative overflow-auto w-full border-t h-[450px]">
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="bg-slate-100 z-40">
//               <TableRow>
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
//                 >
//                   KAM Name
//                 </TableHead>

//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={7}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={2}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Self Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Self)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Transferred
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Transferred)
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[100px] top-[48px]">
//                   Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-[48px]">
//                   Achieve
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.achieved >= stat.targetAmount
//                             ? 'text-emerald-600'
//                             : 'text-orange-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px] text-sm">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
//                       kam.rangeAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
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

// // src/components/tables/KAMPerformanceTable.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table as TableIcon } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   sales: any[];
//   dateRangeType: 'monthly' | 'yearly' | 'quarterly';
//   startMonth?: string;
//   endMonth?: string;
//   startYear: string;
//   endYear: string;
//   quarters?: number[];      // ✅ UPDATED: Array of quarters
//   quarterYear?: string;
//   tablePeriods: any[];
//   loading?: boolean;
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   quarters,                 // ✅ UPDATED
//   quarterYear,
//   tablePeriods,
//   loading = false,
// }) => {
//   // Process data by KAM and period
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     // Group all sales by current_supervisor
//     sales.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           id: kamName,
//           name: kamName,
//           periodData: {},
//         };
//       }

//       // ✅ UPDATED: Create period key matching tablePeriods format based on view mode
//       let periodKey: string;

//       if (dateRangeType === 'monthly') {
//         // ✅ MONTHLY: Use month and year
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;

//       } else if (dateRangeType === 'quarterly') {
//         // ✅ QUARTERLY: Use quarter and year (supports multiple quarters)
//         periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;

//       } else {
//         // ✅ YEARLY: Use year only
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[kamName].periodData[periodKey]) {
//         kamMap[kamName].periodData[periodKey] = {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           transferredAchieved: 0,
//           selfUpDown: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };
//       }

//       // Accumulate data from backend
//       kamMap[kamName].periodData[periodKey].clientCount += Number(row.total_client_count || 0);
//       kamMap[kamName].periodData[periodKey].achieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].periodData[periodKey].selfAchieved += Number(
//         row.self_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].selfUpDown += Number(row.self_up_down_voucher || 0);
//       kamMap[kamName].periodData[periodKey].transferredAchieved += Number(
//         row.transferred_client_voucher_amount || 0
//       );
//       kamMap[kamName].periodData[periodKey].transferredUpDown += Number(
//         row.transfer_up_down_voucher || 0
//       );
//       kamMap[kamName].periodData[periodKey].targetAmount += Number(row.target_amount || 0);
//     });

//     // Convert to array with ordered periods
//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           selfUpDown: 0,
//           transferredAchieved: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };

//         const target = stat.targetAmount;
//         const upDown = stat.achieved - target;

//         rangeTargetSum += target;
//         rangeAchievedSum += stat.achieved;

//         return {
//           target,
//           achieved: stat.achieved,
//           selfAchieved: stat.selfAchieved,
//           selfUpDown: stat.selfUpDown,
//           transferredAchieved: stat.transferredAchieved,
//           transferredUpDown: stat.transferredUpDown,
//           targetAmount: stat.targetAmount,
//           clientCount: stat.clientCount,
//           upDown,
//         };
//       });

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType]);

//   if (loading) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">Loading data...</CardContent>
//       </Card>
//     );
//   }

//   if (sales.length === 0) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           No data available for the selected period
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">
//         <div className="relative overflow-auto w-full border-t h-[450px]">
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="bg-slate-100 z-40">
//               <TableRow>
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
//                 >
//                   KAM Name
//                 </TableHead>

//                 {/* ✅ UPDATED: Display period headers (handles multiple quarters) */}
//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={7}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={2}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Self Achieve
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Self)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Transferred
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Transferred)
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[100px] top-[48px]">
//                   Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-[48px]">
//                   Achieve
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.achieved >= stat.targetAmount
//                             ? 'text-emerald-600'
//                             : 'text-orange-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px] text-sm">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
//                       kam.rangeAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
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

// // src/components/tables/KAMPerformanceTable.tsx
// 'use client';

// import React, { useMemo } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableFooter,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table as TableIcon } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   sales: any[];
//   dateRangeType: 'monthly' | 'yearly' | 'quarterly';
//   startMonth?: string;
//   endMonth?: string;
//   startYear: string;
//   endYear: string;
//   quarters?: number[];
//   quarterYear?: string;
//   tablePeriods: any[];
//   loading?: boolean;
//   filterType?: 'kam' | 'branch'; // ✅ NEW: Add filterType prop
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   startMonth,
//   endMonth,
//   startYear,
//   endYear,
//   quarters,
//   quarterYear,
//   tablePeriods,
//   loading = false,
//   filterType = 'kam', // ✅ NEW: Default to 'kam'
// }) => {
//   // Process data by KAM/Branch and period
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     // ✅ UPDATED: Use branch_name when filterType is 'branch', otherwise use current_supervisor
//     sales.forEach((row) => {
//       const entityName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

//       if (!kamMap[entityName]) {
//         kamMap[entityName] = {
//           id: entityName,
//           name: entityName,
//           periodData: {},
//         };
//       }

//       // ✅ UPDATED: Create period key matching tablePeriods format based on view mode
//       let periodKey: string;

//       if (dateRangeType === 'monthly') {
//         // ✅ MONTHLY: Use month and year
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;
//       } else if (dateRangeType === 'quarterly') {
//         // ✅ QUARTERLY: Use quarter and year (supports multiple quarters)
//         periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;
//       } else {
//         // ✅ YEARLY: Use year only
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[entityName].periodData[periodKey]) {
//         kamMap[entityName].periodData[periodKey] = {
//           clientCount: 0,
//           achieved: 0,
//           successAchieved: 0,
//           selfAchieved: 0,
//           transferredAchieved: 0,
//           selfUpDown: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//         };
//       }

//       // Accumulate data from backend
//       kamMap[entityName].periodData[periodKey].clientCount += Number(row.total_client_count || 0);
//       kamMap[entityName].periodData[periodKey].achieved += Number(row.total_voucher_amount || 0);
//       kamMap[entityName].periodData[periodKey].selfAchieved += Number(
//         row.self_client_voucher_amount || 0
//       );
//       kamMap[entityName].periodData[periodKey].selfUpDown += Number(row.self_up_down_voucher || 0);
//       kamMap[entityName].periodData[periodKey].transferredAchieved += Number(
//         row.transferred_client_voucher_amount || 0
//       );
//       kamMap[entityName].periodData[periodKey].transferredUpDown += Number(
//         row.transfer_up_down_voucher || 0
//       );
//       kamMap[entityName].periodData[periodKey].targetAmount += Number(row.target_amount || 0);
//       kamMap[entityName].periodData[periodKey].successAchieved += Number(row.pending_amount || 0);
//     });

//     // Convert to array with ordered periods
//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0;
//       let rangeAchievedSum = 0;
//       let rangeSuccessAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0,
//           achieved: 0,
//           selfAchieved: 0,
//           selfUpDown: 0,
//           transferredAchieved: 0,
//           transferredUpDown: 0,
//           targetAmount: 0,
//           successAchieved: 0,
//         };

//         const target = stat.targetAmount;
//         const upDown = stat.achieved - target;

//         rangeTargetSum += target;
//         rangeAchievedSum += stat.achieved;
//         rangeSuccessAchievedSum += stat.successAchieved;

//         return {
//           target,
//           achieved: stat.achieved,
//           selfAchieved: stat.selfAchieved,
//           selfUpDown: stat.selfUpDown,
//           transferredAchieved: stat.transferredAchieved,
//           transferredUpDown: stat.transferredUpDown,
//           targetAmount: stat.targetAmount,
//           clientCount: stat.clientCount,
//           upDown,
//           successAchieved: stat.successAchieved,
//         };
//       });

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//         rangeSuccessAchievedSum,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType, filterType]); // ✅ Added filterType dependency

//   if (loading) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">Loading data...</CardContent>
//       </Card>
//     );
//   }

//   if (sales.length === 0) {
//     return (
//       <Card className="shadow-sm border-muted/60">
//         <CardContent className="p-6 text-center text-muted-foreground">
//           No data available for the selected period
//         </CardContent>
//       </Card>
//     );
//   }

//   // ✅ NEW: Dynamic header label
//   const entityLabel = filterType === 'branch' ? 'Branch Name' : 'KAM Name';

//   const footerTotals = kamPerformanceData.reduce(
//     (acc, kam) => {
//       acc.totalInvoice += kam.rangeAchievedSum || 0;
//       acc.totalTarget += kam.rangeTargetSum || 0;
//       acc.totalAchievement += kam.rangeSuccessAchievedSum || 0;
//       return acc;
//     },
//     {
//       totalInvoice: 0,
//       totalTarget: 0,
//       totalAchievement: 0,
//     }
//   );

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       {/* <CardContent className="p-0">
//         <div className="relative overflow-auto w-full border-t h-[450px]">
//           <Table className="w-full table-auto border-separate border-spacing-0">
//             <TableHeader className="bg-slate-100 z-40">
//               <TableRow>
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[60]"
//                 >
//                   {entityLabel} 
//                 </TableHead>

              
//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={9}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-50"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}

//                 <TableHead
//                   colSpan={3}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[60]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow>
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Clients
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Target
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieved
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Achieved (%)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Total Invoice
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Self (Invocie)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Self)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Transferred (Invocie)
//                     </TableHead>
//                     <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
//                       Up / Down (Transferred)
//                     </TableHead>
//                   </React.Fragment>
//                 ))}

//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[191px] top-0 z-10">
//                   Total Invoice
//                 </TableHead>
//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky right-[119px] top-0">
//                   Total Target
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky right-0 top-0">
//                   Total Achievement
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b sticky left-0 bg-white z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat, i) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.successAchieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {stat.targetAmount > 0
//                           ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(2)}%`
//                           : '0%'}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.achieved >= stat.targetAmount
//                             ? 'text-emerald-600'
//                             : 'text-orange-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>

//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell
//                         className={`text-center border-r border-b font-semibold text-sm ${
//                           stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
//                         }`}
//                       >
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-[191px] text-sm ${
//                       kam.rangeAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
//                     {formatCurrency(kam.rangeAchievedSum)}
//                   </TableCell>
//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[119px] text-sm">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   <TableCell
//                     className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
//                       kam.rangeSuccessAchievedSum >= kam.rangeTargetSum
//                         ? 'text-emerald-700'
//                         : 'text-destructive'
//                     }`}
//                   >
//                     {formatCurrency(kam.rangeSuccessAchievedSum)}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent> */}

//       <CardContent className="p-0">
//         <Table
//           // This targets the wrapper div inside your Table UI component
//           containerClassName="h-[390px] overflow-auto relative"
//           // This targets the table element itself
//           className="border-separate border-spacing-0"
//         >
//           <TableHeader className="bg-slate-100">
//             {/* ROW 1: ENTITY NAME & MONTHS */}
//             <TableRow className="hover:bg-transparent border-none">
//               <TableHead
//                 rowSpan={2}
//                 className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[100] h-[80px]"
//               >
//                 {entityLabel}
//               </TableHead>

//               {tablePeriods.map((p) => (
//                 <TableHead
//                   key={p.label}
//                   colSpan={9}
//                   className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-[80] h-[40px]"
//                 >
//                   {p.label}
//                 </TableHead>
//               ))}

//               <TableHead
//                 colSpan={3}
//                 className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[100] min-w-[360px] h-[40px]"
//               >
//                 TOTAL
//               </TableHead>
//             </TableRow>

//             {/* ROW 2: SUB-METRICS */}
//             <TableRow className="hover:bg-transparent border-none">
//               {tablePeriods.map((_, i) => (
//                 <React.Fragment key={i}>
//                   {[
//                     'Clients',
//                     'Target',
//                     'Achieved',
//                     'Achieved (%)',
//                     'Total Invoice',
//                     'Self (Invoice)',
//                     'Up / Down (Self)',
//                     'Transferred (Invoice)',
//                     'Up / Down (Transferred)',
//                   ].map((header) => (
//                     <TableHead
//                       key={header}
//                       className="text-center border-r border-b text-[10px] uppercase bg-slate-50 sticky top-[40px] z-[70] h-[40px]"
//                     >
//                       {header}
//                     </TableHead>
//                   ))}
//                 </React.Fragment>
//               ))}

//               <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[240px] z-[90] min-w-[120px] h-[40px]">
//                 Total Invoice
//               </TableHead>
//               <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[120px] z-[90] min-w-[120px] h-[40px]">
//                 Total Target
//               </TableHead>
//               <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-0 z-[90] min-w-[120px] h-[40px]">
//                 Total Achievement
//               </TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {kamPerformanceData.map((kam) => (
//               <TableRow key={kam.id} className="hover:bg-muted/20">
//                 <TableCell className="font-medium border-r border-b bg-white sticky left-0 z-20">
//                   {kam.name}
//                 </TableCell>

//                 {kam.periodStats.map((stat, i) => (
//                   <React.Fragment key={i}>
//                     <TableCell className="text-center border-r border-b text-sm">
//                       {stat.clientCount}
//                     </TableCell>
//                     <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                       {formatCurrency(stat.targetAmount)}
//                     </TableCell>
//                     <TableCell
//                       className={`text-center border-r border-b font-semibold text-sm ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
//                     >
//                       {formatCurrency(stat.successAchieved)}
//                     </TableCell>
//                     <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                       {stat.targetAmount > 0
//                         ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(2)}%`
//                         : '0%'}
//                     </TableCell>
//                     <TableCell
//                       className={`text-center border-r border-b font-semibold text-sm ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}
//                     >
//                       {formatCurrency(stat.achieved)}
//                     </TableCell>
//                     <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                       {formatCurrency(stat.selfAchieved)}
//                     </TableCell>
//                     <TableCell
//                       className={`text-center border-r border-b font-semibold text-sm ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
//                     >
//                       {formatCurrency(stat.selfUpDown)}
//                     </TableCell>
//                     <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                       {formatCurrency(stat.transferredAchieved)}
//                     </TableCell>
//                     <TableCell
//                       className={`text-center border-r border-b font-semibold text-sm ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
//                     >
//                       {formatCurrency(stat.transferredUpDown)}
//                     </TableCell>
//                   </React.Fragment>
//                 ))}

//                 <TableCell
//                   className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[240px] z-10 ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}
//                 >
//                   {formatCurrency(kam.rangeAchievedSum)}
//                 </TableCell>
//                 <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[120px] z-10">
//                   {formatCurrency(kam.rangeTargetSum)}
//                 </TableCell>
//                 <TableCell
//                   className={`text-center border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-0 z-10 ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}
//                 >
//                   {formatCurrency(kam.rangeSuccessAchievedSum)}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//           <TableFooter className="sticky bottom-0 z-[40] bg-slate-200">
//             <TableRow className="font-bold">
//               {/* ✅ GRAND TOTAL – LEFT FROZEN (NO COLSPAN) */}
//               <TableCell
//                 className="
//         sticky
//         left-0
//         bottom-0
//         z-[300]
//         bg-slate-300
//         border-t
//         min-w-[180px]
//       "
//               >
//                 GRAND TOTAL
//               </TableCell>

//               {/* 🔹 FAKE EMPTY CELLS (scrollable area) */}
//               {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
//                 <TableCell key={i} className="border-t bg-slate-200" />
//               ))}

//               {/* ✅ RIGHT FROZEN TOTALS */}
//               <TableCell className="sticky right-[240px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
//                 {formatCurrency(footerTotals.totalInvoice)}
//               </TableCell>

//               <TableCell className="sticky right-[120px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
//                 {formatCurrency(footerTotals.totalTarget)}
//               </TableCell>

//               <TableCell
//                 className={`sticky right-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${
//                   footerTotals.totalAchievement >= footerTotals.totalTarget
//                     ? 'text-emerald-700'
//                     : 'text-destructive'
//                 }`}
//               >
//                 {formatCurrency(footerTotals.totalAchievement)}
//               </TableCell>
//             </TableRow>
//           </TableFooter>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// };



// src/components/tables/KAMPerformanceTable.tsx
'use client';

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as TableIcon } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';

const MONTHS_ARRAY = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  sales: any[];
  dateRangeType: 'monthly' | 'yearly' | 'quarterly';
  startMonth?: string;
  endMonth?: string;
  startYear: string;
  endYear: string;
  quarters?: number[];
  quarterYear?: string;
  tablePeriods: any[];
  loading?: boolean;
  filterType?: 'kam' | 'branch';
}

export const KAMPerformanceTable: React.FC<Props> = ({
  sales,
  dateRangeType,
  tablePeriods,
  loading = false,
  filterType = 'kam',
}) => {
  const kamPerformanceData = useMemo(() => {
    const kamMap: any = {};

    sales.forEach((row) => {
      const entityName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

      if (!kamMap[entityName]) {
        kamMap[entityName] = { id: entityName, name: entityName, periodData: {} };
      }

      let periodKey: string;
      if (dateRangeType === 'monthly') {
        periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;
      } else if (dateRangeType === 'quarterly') {
        periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;
      } else {
        periodKey = `${row.voucher_year}`;
      }

      if (!kamMap[entityName].periodData[periodKey]) {
        kamMap[entityName].periodData[periodKey] = {
          clientCount: 0, achieved: 0, successAchieved: 0,
          selfAchieved: 0, transferredAchieved: 0,
          selfUpDown: 0, transferredUpDown: 0, targetAmount: 0,
        };
      }

      const p = kamMap[entityName].periodData[periodKey];
      p.clientCount         += Number(row.total_client_count || 0);
      p.achieved            += Number(row.total_voucher_amount || 0);
      p.selfAchieved        += Number(row.self_client_voucher_amount || 0);
      p.selfUpDown          += Number(row.self_up_down_voucher || 0);
      p.transferredAchieved += Number(row.transferred_client_voucher_amount || 0);
      p.transferredUpDown   += Number(row.transfer_up_down_voucher || 0);
      p.targetAmount        += Number(row.target_amount || 0);
      p.successAchieved     += Number(row.pending_amount || 0);
    });

    return Object.values(kamMap).map((kam: any) => {
      let rangeTargetSum = 0, rangeAchievedSum = 0, rangeSuccessAchievedSum = 0;

      const periodStats = tablePeriods.map((period) => {
        const stat = kam.periodData[period.label] || {
          clientCount: 0, achieved: 0, selfAchieved: 0, selfUpDown: 0,
          transferredAchieved: 0, transferredUpDown: 0, targetAmount: 0, successAchieved: 0,
        };
        rangeTargetSum          += stat.targetAmount;
        rangeAchievedSum        += stat.achieved;
        rangeSuccessAchievedSum += stat.successAchieved;
        return { ...stat, upDown: stat.achieved - stat.targetAmount };
      });

      return { ...kam, periodStats, rangeTargetSum, rangeAchievedSum, rangeSuccessAchievedSum };
    });
  }, [sales, tablePeriods, dateRangeType, filterType]);

  if (loading) {
    return (
      <Card className="shadow-sm border-muted/60">
        <CardContent className="p-6 text-center text-muted-foreground">Loading data...</CardContent>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card className="shadow-sm border-muted/60">
        <CardContent className="p-6 text-center text-muted-foreground">
          No data available for the selected period
        </CardContent>
      </Card>
    );
  }

  const entityLabel = filterType === 'branch' ? 'Branch Name' : 'KAM Name';

  const footerTotals = kamPerformanceData.reduce(
    (acc, kam) => {
      acc.totalInvoice     += kam.rangeAchievedSum || 0;
      acc.totalTarget      += kam.rangeTargetSum || 0;
      acc.totalAchievement += kam.rangeSuccessAchievedSum || 0;
      return acc;
    },
    { totalInvoice: 0, totalTarget: 0, totalAchievement: 0 }
  );

  const SUB_HEADERS = [
    'Clients', 'Target', 'Achieved', 'Ach.%',
    'Invoice', 'Self', 'U/D Self',
    'Transfer', 'U/D Trans.',
  ];

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-primary" />
          Performance Analysis Matrix
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">

        {/* ==================== MOBILE (< md) ==================== */}
        <div className="block md:hidden w-full overflow-auto max-h-[75vh]">
          <table className="border-separate border-spacing-0 text-xs w-max min-w-full">

            <thead>
              {/* ROW 1 — entity label + period group headers */}
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 top-0 z-[20] bg-slate-100 border-r border-b px-2 py-2 text-left font-bold min-w-[110px] max-w-[110px] whitespace-normal leading-tight"
                >
                  {entityLabel}
                </th>
                {tablePeriods.map((p) => (
                  <th
                    key={p.label}
                    colSpan={9}
                    className="sticky top-0 z-[10] bg-slate-100 border-r border-b px-2 py-2 text-center font-semibold whitespace-nowrap"
                  >
                    {p.label}
                  </th>
                ))}
                <th
                  colSpan={3}
                  className="sticky top-0 z-[10] bg-slate-200 border-b px-2 py-2 text-center font-bold whitespace-nowrap"
                >
                  TOTAL
                </th>
              </tr>

              {/* ROW 2 — sub-metric headers */}
              <tr>
                {tablePeriods.map((_, pi) => (
                  <React.Fragment key={pi}>
                    {SUB_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="sticky top-[33px] z-[10] bg-slate-50 border-r border-b px-1.5 py-1.5 text-center text-[9px] uppercase font-semibold text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">Invoice</th>
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">Target</th>
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">Achiev.</th>
              </tr>
            </thead>

            <tbody>
              {kamPerformanceData.map((kam, ki) => (
                <tr key={kam.id} className={ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>

                  {/* ✅ Sticky left — explicit bg per alternating row (NOT bg-inherit) */}
                  <td
                    className={`sticky left-0 z-[20] border-r border-b px-2 py-2 font-medium min-w-[110px] max-w-[110px] whitespace-normal leading-tight text-[10px] ${ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                  >
                    {kam.name}
                  </td>

                  {/* Period data */}
                  {kam.periodStats.map((stat: any, si: number) => (
                    <React.Fragment key={si}>
                      <td className="border-r border-b px-1.5 py-1.5 text-center whitespace-nowrap">{stat.clientCount}</td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">{formatCurrency(stat.targetAmount)}</td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.successAchieved)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
                        {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {formatCurrency(stat.achieved)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">{formatCurrency(stat.selfAchieved)}</td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.selfUpDown)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">{formatCurrency(stat.transferredAchieved)}</td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.transferredUpDown)}
                      </td>
                    </React.Fragment>
                  ))}

                  {/* Row totals */}
                  <td className={`border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.rangeAchievedSum)}
                  </td>
                  <td className="border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap">
                    {formatCurrency(kam.rangeTargetSum)}
                  </td>
                  <td className={`border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.rangeSuccessAchievedSum)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="sticky bottom-0 z-[50]">
              <tr className="font-bold bg-slate-200">
                {/* ✅ z-[60] so corner sits above body sticky cells */}
                <td className="sticky left-0 z-[10] bg-slate-300 border-t border-r px-2 py-2 text-[10px] font-bold min-w-[110px] whitespace-nowrap">
                  GRAND TOTAL
                </td>
                {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
                  <td key={i} className="border-t bg-slate-200 px-1.5 py-2" />
                ))}
                <td className="border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap">
                  {formatCurrency(footerTotals.totalInvoice)}
                </td>
                <td className="border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap">
                  {formatCurrency(footerTotals.totalTarget)}
                </td>
                <td className={`border-t px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap ${footerTotals.totalAchievement >= footerTotals.totalTarget ? 'text-emerald-700' : 'text-destructive'}`}>
                  {formatCurrency(footerTotals.totalAchievement)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ==================== DESKTOP (md+) — UNCHANGED ==================== */}
        <div className="hidden md:block">
          <Table
            containerClassName="h-[390px] overflow-auto relative"
            className="border-separate border-spacing-0"
          >
            <TableHeader className="bg-slate-100">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead
                  rowSpan={2}
                  className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[100] h-[80px]"
                >
                  {entityLabel}
                </TableHead>
                {tablePeriods.map((p) => (
                  <TableHead
                    key={p.label}
                    colSpan={9}
                    className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-[80] h-[40px]"
                  >
                    {p.label}
                  </TableHead>
                ))}
                <TableHead
                  colSpan={3}
                  className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[100] min-w-[360px] h-[40px]"
                >
                  TOTAL
                </TableHead>
              </TableRow>

              <TableRow className="hover:bg-transparent border-none">
                {tablePeriods.map((_, i) => (
                  <React.Fragment key={i}>
                    {[
                      'Clients', 'Target', 'Achieved', 'Achieved (%)',
                      'Total Invoice', 'Self (Invoice)', 'Up / Down (Self)',
                      'Transferred (Invoice)', 'Up / Down (Transferred)',
                    ].map((header) => (
                      <TableHead
                        key={header}
                        className="text-center border-r border-b text-[10px] uppercase bg-slate-50 sticky top-[40px] z-[70] h-[40px]"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </React.Fragment>
                ))}
                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[240px] z-[90] min-w-[120px] h-[40px]">Total Invoice</TableHead>
                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[120px] z-[90] min-w-[120px] h-[40px]">Total Target</TableHead>
                <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-0 z-[90] min-w-[120px] h-[40px]">Total Achievement</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {kamPerformanceData.map((kam) => (
                <TableRow key={kam.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium border-r border-b bg-white sticky left-0 z-20">{kam.name}</TableCell>
                  {kam.periodStats.map((stat: any, i: number) => (
                    <React.Fragment key={i}>
                      <TableCell className="text-center border-r border-b text-sm">{stat.clientCount}</TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">{formatCurrency(stat.targetAmount)}</TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(stat.successAchieved)}</TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(2)}%` : '0%'}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>{formatCurrency(stat.achieved)}</TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">{formatCurrency(stat.selfAchieved)}</TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(stat.selfUpDown)}</TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">{formatCurrency(stat.transferredAchieved)}</TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(stat.transferredUpDown)}</TableCell>
                    </React.Fragment>
                  ))}
                  <TableCell className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[240px] z-10 ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>{formatCurrency(kam.rangeAchievedSum)}</TableCell>
                  <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[120px] z-10">{formatCurrency(kam.rangeTargetSum)}</TableCell>
                  <TableCell className={`text-center border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-0 z-10 ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>{formatCurrency(kam.rangeSuccessAchievedSum)}</TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="sticky bottom-0 z-[40] bg-slate-200">
              <TableRow className="font-bold">
                <TableCell className="sticky left-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[180px]">GRAND TOTAL</TableCell>
                {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
                  <TableCell key={i} className="border-t bg-slate-200" />
                ))}
                <TableCell className="sticky right-[240px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">{formatCurrency(footerTotals.totalInvoice)}</TableCell>
                <TableCell className="sticky right-[120px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">{formatCurrency(footerTotals.totalTarget)}</TableCell>
                <TableCell className={`sticky right-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${footerTotals.totalAchievement >= footerTotals.totalTarget ? 'text-emerald-700' : 'text-destructive'}`}>{formatCurrency(footerTotals.totalAchievement)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
};