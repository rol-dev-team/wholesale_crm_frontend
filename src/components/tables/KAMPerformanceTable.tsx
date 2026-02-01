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
  dateRangeType: 'monthly' | 'yearly' | 'quarterly';
  startMonth?: string;
  endMonth?: string;
  startYear: string;
  endYear: string;
  quarters?: number[];
  quarterYear?: string;
  tablePeriods: any[];
  loading?: boolean;
  filterType?: 'kam' | 'branch'; // ✅ NEW: Add filterType prop
}

export const KAMPerformanceTable: React.FC<Props> = ({
  sales,
  dateRangeType,
  startMonth,
  endMonth,
  startYear,
  endYear,
  quarters,
  quarterYear,
  tablePeriods,
  loading = false,
  filterType = 'kam', // ✅ NEW: Default to 'kam'
}) => {
  // Process data by KAM/Branch and period
  const kamPerformanceData = useMemo(() => {
    const kamMap: any = {};

    // ✅ UPDATED: Use branch_name when filterType is 'branch', otherwise use current_supervisor
    sales.forEach((row) => {
      const entityName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

      if (!kamMap[entityName]) {
        kamMap[entityName] = {
          id: entityName,
          name: entityName,
          periodData: {},
        };
      }

      // ✅ UPDATED: Create period key matching tablePeriods format based on view mode
      let periodKey: string;

      if (dateRangeType === 'monthly') {
        // ✅ MONTHLY: Use month and year
        periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;

      } else if (dateRangeType === 'quarterly') {
        // ✅ QUARTERLY: Use quarter and year (supports multiple quarters)
        periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;

      } else {
        // ✅ YEARLY: Use year only
        periodKey = `${row.voucher_year}`;
      }

      if (!kamMap[entityName].periodData[periodKey]) {
        kamMap[entityName].periodData[periodKey] = {
          clientCount: 0,
          achieved: 0,
          selfAchieved: 0,
          transferredAchieved: 0,
          selfUpDown: 0,
          transferredUpDown: 0,
          targetAmount: 0,
        };
      }

      // Accumulate data from backend
      kamMap[entityName].periodData[periodKey].clientCount += Number(row.total_client_count || 0);
      kamMap[entityName].periodData[periodKey].achieved += Number(row.total_voucher_amount || 0);
      kamMap[entityName].periodData[periodKey].selfAchieved += Number(
        row.self_client_voucher_amount || 0
      );
      kamMap[entityName].periodData[periodKey].selfUpDown += Number(row.self_up_down_voucher || 0);
      kamMap[entityName].periodData[periodKey].transferredAchieved += Number(
        row.transferred_client_voucher_amount || 0
      );
      kamMap[entityName].periodData[periodKey].transferredUpDown += Number(
        row.transfer_up_down_voucher || 0
      );
      kamMap[entityName].periodData[periodKey].targetAmount += Number(row.target_amount || 0);
    });

    // Convert to array with ordered periods
    return Object.values(kamMap).map((kam: any) => {
      let rangeTargetSum = 0;
      let rangeAchievedSum = 0;

      const periodStats = tablePeriods.map((period) => {
        const stat = kam.periodData[period.label] || {
          clientCount: 0,
          achieved: 0,
          selfAchieved: 0,
          selfUpDown: 0,
          transferredAchieved: 0,
          transferredUpDown: 0,
          targetAmount: 0,
        };

        const target = stat.targetAmount;
        const upDown = stat.achieved - target;

        rangeTargetSum += target;
        rangeAchievedSum += stat.achieved;

        return {
          target,
          achieved: stat.achieved,
          selfAchieved: stat.selfAchieved,
          selfUpDown: stat.selfUpDown,
          transferredAchieved: stat.transferredAchieved,
          transferredUpDown: stat.transferredUpDown,
          targetAmount: stat.targetAmount,
          clientCount: stat.clientCount,
          upDown,
        };
      });

      return {
        ...kam,
        periodStats,
        rangeTargetSum,
        rangeAchievedSum,
      };
    });
  }, [sales, tablePeriods, dateRangeType, filterType]); // ✅ Added filterType dependency

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

  // ✅ NEW: Dynamic header label
  const entityLabel = filterType === 'branch' ? 'Branch Name' : 'KAM Name';

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
                  {entityLabel} {/* ✅ UPDATED: Dynamic header */}
                </TableHead>

                {/* ✅ UPDATED: Display period headers (handles multiple quarters) */}
                {tablePeriods.map((p) => (
                  <TableHead
                    key={p.label}
                    colSpan={7}
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
                      Total Invoice
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Self (Invocie)
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Up / Down (Self)
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Transferred (Invocie)
                    </TableHead>
                    <TableHead className="text-center border-r border-b text-[10px] uppercase sticky top-[48px] bg-slate-50">
                      Up / Down (Transferred)
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
                      <TableCell className="text-center border-r border-b text-sm">
                        {stat.clientCount}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.targetAmount)}
                      </TableCell>
                      <TableCell
                        className={`text-center border-r border-b font-semibold text-sm ${
                          stat.achieved >= stat.targetAmount
                            ? 'text-emerald-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {formatCurrency(stat.achieved)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.selfAchieved)}
                      </TableCell>
                      <TableCell
                        className={`text-center border-r border-b font-semibold text-sm ${
                          stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(stat.selfUpDown)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.transferredAchieved)}
                      </TableCell>
                      <TableCell
                        className={`text-center border-r border-b font-semibold text-sm ${
                          stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(stat.transferredUpDown)}
                      </TableCell>
                    </React.Fragment>
                  ))}

                  <TableCell className="text-center border-r border-b font-bold bg-slate-50 sticky right-[100px] text-sm">
                    {formatCurrency(kam.rangeTargetSum)}
                  </TableCell>
                  <TableCell
                    className={`text-center border-b font-bold bg-slate-50 sticky right-0 text-sm ${
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