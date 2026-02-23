

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
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
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
//   filterType?: 'kam' | 'branch';
// }

// export const KAMPerformanceTable: React.FC<Props> = ({
//   sales,
//   dateRangeType,
//   tablePeriods,
//   loading = false,
//   filterType = 'kam',
// }) => {
//   const kamPerformanceData = useMemo(() => {
//     const kamMap: any = {};

//     sales.forEach((row) => {
//       const entityName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

//       if (!kamMap[entityName]) {
//         kamMap[entityName] = { id: entityName, name: entityName, periodData: {} };
//       }

//       let periodKey: string;
//       if (dateRangeType === 'monthly') {
//         periodKey = `${MONTHS_ARRAY[row.voucher_month_number - 1]} ${row.voucher_year}`;
//       } else if (dateRangeType === 'quarterly') {
//         periodKey = `Q${row.voucher_quarter} ${row.voucher_year}`;
//       } else {
//         periodKey = `${row.voucher_year}`;
//       }

//       if (!kamMap[entityName].periodData[periodKey]) {
//         kamMap[entityName].periodData[periodKey] = {
//           clientCount: 0, achieved: 0, successAchieved: 0,
//           selfAchieved: 0, transferredAchieved: 0,
//           selfUpDown: 0, transferredUpDown: 0, targetAmount: 0,
//         };
//       }

//       const p = kamMap[entityName].periodData[periodKey];
//       p.clientCount         += Number(row.total_client_count || 0);
//       p.achieved            += Number(row.total_voucher_amount || 0);
//       p.selfAchieved        += Number(row.self_client_voucher_amount || 0);
//       p.selfUpDown          += Number(row.self_up_down_voucher || 0);
//       p.transferredAchieved += Number(row.transferred_client_voucher_amount || 0);
//       p.transferredUpDown   += Number(row.transfer_up_down_voucher || 0);
//       p.targetAmount        += Number(row.target_amount || 0);
//       p.successAchieved     += Number(row.pending_amount || 0);
//     });

//     return Object.values(kamMap).map((kam: any) => {
//       let rangeTargetSum = 0, rangeAchievedSum = 0, rangeSuccessAchievedSum = 0;

//       const periodStats = tablePeriods.map((period) => {
//         const stat = kam.periodData[period.label] || {
//           clientCount: 0, achieved: 0, selfAchieved: 0, selfUpDown: 0,
//           transferredAchieved: 0, transferredUpDown: 0, targetAmount: 0, successAchieved: 0,
//         };
//         rangeTargetSum          += stat.targetAmount;
//         rangeAchievedSum        += stat.achieved;
//         rangeSuccessAchievedSum += stat.successAchieved;
//         return { ...stat, upDown: stat.achieved - stat.targetAmount };
//       });

//       // ✅ Overall Achievement = last period Achieved - first period Achieved
//       // Use `successAchieved` which maps to the "Achieved" column in the UI
//       const firstPeriodAchievement = periodStats.length > 0 ? periodStats[0].successAchieved : 0;
//       const lastPeriodAchievement  = periodStats.length > 0 ? periodStats[periodStats.length - 1].successAchieved : 0;
//       const overallAchievement     = lastPeriodAchievement - firstPeriodAchievement;

//       return {
//         ...kam,
//         periodStats,
//         rangeTargetSum,
//         rangeAchievedSum,
//         rangeSuccessAchievedSum,
//         overallAchievement,
//       };
//     });
//   }, [sales, tablePeriods, dateRangeType, filterType]);

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

//   const entityLabel = filterType === 'branch' ? 'Branch Name' : 'KAM Name';

//   // ✅ footerTotals now includes totalOverallAchievement
//   const footerTotals = kamPerformanceData.reduce(
//     (acc, kam) => {
//       acc.totalInvoice            += kam.rangeAchievedSum || 0;
//       acc.totalTarget             += kam.rangeTargetSum || 0;
//       acc.totalAchievement        += kam.rangeSuccessAchievedSum || 0;
//       acc.totalOverallAchievement += kam.overallAchievement || 0;
//       return acc;
//     },
//     { totalInvoice: 0, totalTarget: 0, totalAchievement: 0, totalOverallAchievement: 0 }
//   );

//   const SUB_HEADERS = [
//     'Clients', 'Target', 'Achieved', 'Ach.%',
//     'Invoice', 'Self', 'U/D Self',
//     'Transfer', 'U/D Trans.',
//   ];

//   return (
//     <Card className="shadow-sm border-muted/60 overflow-hidden">
//       <CardHeader className="py-4">
//         <CardTitle className="text-base font-medium flex items-center gap-2">
//           <TableIcon className="h-4 w-4 text-primary" />
//           Performance Analysis Matrix
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="p-0">

//         {/* ==================== MOBILE (< md) ==================== */}
//         <div className="block md:hidden w-full overflow-auto max-h-[75vh]">
//           <table className="border-separate border-spacing-0 text-xs w-max min-w-full">

//             <thead>
//               {/* ROW 1 — entity label + period group headers */}
//               <tr>
//                 <th
//                   rowSpan={2}
//                   className="sticky left-0 top-0 z-[20] bg-slate-100 border-r border-b px-2 py-2 text-left font-bold min-w-[110px] max-w-[110px] whitespace-normal leading-tight"
//                 >
//                   {entityLabel}
//                 </th>
//                 {tablePeriods.map((p) => (
//                   <th
//                     key={p.label}
//                     colSpan={9}
//                     className="sticky top-0 z-[10] bg-slate-100 border-r border-b px-2 py-2 text-center font-semibold whitespace-nowrap"
//                   >
//                     {p.label}
//                   </th>
//                 ))}
//                 {/* ✅ colSpan 3 → 4 */}
//                 <th
//                   colSpan={4}
//                   className="sticky top-0 z-[10] bg-slate-200 border-b px-2 py-2 text-center font-bold whitespace-nowrap"
//                 >
//                   TOTAL
//                 </th>
//               </tr>

//               {/* ROW 2 — sub-metric headers */}
//               <tr>
//                 {tablePeriods.map((_, pi) => (
//                   <React.Fragment key={pi}>
//                     {SUB_HEADERS.map((h) => (
//                       <th
//                         key={h}
//                         className="sticky top-[33px] z-[10] bg-slate-50 border-r border-b px-1.5 py-1.5 text-center text-[9px] uppercase font-semibold text-slate-500 whitespace-nowrap"
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </React.Fragment>
//                 ))}
//                 <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
//                   Invoice
//                 </th>
//                 <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
//                   Target
//                 </th>
//                 {/* ✅ NEW */}
//                 <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
//                   Overall
//                 </th>
//                 <th className="sticky top-[33px] z-[10] bg-slate-200 border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
//                   Achiev.
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {kamPerformanceData.map((kam, ki) => (
//                 <tr key={kam.id} className={ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>

//                   <td
//                     className={`sticky left-0 z-[20] border-r border-b px-2 py-2 font-medium min-w-[110px] max-w-[110px] whitespace-normal leading-tight text-[10px] ${ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
//                   >
//                     {kam.name}
//                   </td>

//                   {/* Period data */}
//                   {kam.periodStats.map((stat: any, si: number) => (
//                     <React.Fragment key={si}>
//                       <td className="border-r border-b px-1.5 py-1.5 text-center whitespace-nowrap">
//                         {stat.clientCount}
//                       </td>
//                       <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
//                         {formatCurrency(stat.targetAmount)}
//                       </td>
//                       <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.successAchieved)}
//                       </td>
//                       <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
//                         {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(1)}%` : '0%'}
//                       </td>
//                       <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>
//                         {formatCurrency(stat.achieved)}
//                       </td>
//                       <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
//                         {formatCurrency(stat.selfAchieved)}
//                       </td>
//                       <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.selfUpDown)}
//                       </td>
//                       <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </td>
//                       <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.transferredUpDown)}
//                       </td>
//                     </React.Fragment>
//                   ))}

//                   {/* Row totals */}
//                   <td className={`border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
//                     {formatCurrency(kam.rangeAchievedSum)}
//                   </td>
//                   <td className="border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </td>
//                   {/* ✅ NEW Overall Achievement cell */}
//                   <td className={`border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.overallAchievement >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
//                     {formatCurrency(kam.overallAchievement)}
//                   </td>
//                   <td className={`border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
//                     {formatCurrency(kam.rangeSuccessAchievedSum)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>

//             <tfoot className="sticky bottom-0 z-[50]">
//               <tr className="font-bold bg-slate-200">
//                 <td className="sticky left-0 z-[10] bg-slate-300 border-t border-r px-2 py-2 text-[10px] font-bold min-w-[110px] whitespace-nowrap">
//                   GRAND TOTAL
//                 </td>
//                 {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
//                   <td key={i} className="border-t bg-slate-200 px-1.5 py-2" />
//                 ))}
//                 <td className="border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap">
//                   {formatCurrency(footerTotals.totalInvoice)}
//                 </td>
//                 <td className="border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap">
//                   {formatCurrency(footerTotals.totalTarget)}
//                 </td>
//                 {/* ✅ NEW Overall Achievement footer */}
//                 <td className={`border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap ${footerTotals.totalOverallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
//                   {formatCurrency(footerTotals.totalOverallAchievement)}
//                 </td>
//                 <td className={`border-t px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap ${footerTotals.totalAchievement >= footerTotals.totalTarget ? 'text-emerald-700' : 'text-destructive'}`}>
//                   {formatCurrency(footerTotals.totalAchievement)}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         {/* ==================== DESKTOP (md+) ==================== */}
//         <div className="hidden md:block">
//           <Table
//             containerClassName="h-[390px] overflow-auto relative"
//             className="border-separate border-spacing-0"
//           >
//             <TableHeader className="bg-slate-100">
//               <TableRow className="hover:bg-transparent border-none">
//                 <TableHead
//                   rowSpan={2}
//                   className="border-r border-b font-bold min-w-[180px] sticky left-0 top-0 bg-slate-100 z-[100] h-[80px]"
//                 >
//                   {entityLabel}
//                 </TableHead>
//                 {tablePeriods.map((p) => (
//                   <TableHead
//                     key={p.label}
//                     colSpan={9}
//                     className="text-center border-r border-b font-semibold min-w-[600px] sticky top-0 bg-slate-100 z-[80] h-[40px]"
//                   >
//                     {p.label}
//                   </TableHead>
//                 ))}
//                 {/* ✅ colSpan 3 → 4, min-w 360 → 480 */}
//                 <TableHead
//                   colSpan={4}
//                   className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[100] min-w-[480px] h-[40px]"
//                 >
//                   TOTAL
//                 </TableHead>
//               </TableRow>

//               <TableRow className="hover:bg-transparent border-none">
//                 {tablePeriods.map((_, i) => (
//                   <React.Fragment key={i}>
//                     {[
//                       'Clients', 'Target', 'Achieved', 'Achieved (%)',
//                       'Total Invoice', 'Self (Invoice)', 'Up / Down (Self)',
//                       'Transferred (Invoice)', 'Up / Down (Transferred)',
//                     ].map((header) => (
//                       <TableHead
//                         key={header}
//                         className="text-center border-r border-b text-[10px] uppercase bg-slate-50 sticky top-[40px] z-[70] h-[40px]"
//                       >
//                         {header}
//                       </TableHead>
//                     ))}
//                   </React.Fragment>
//                 ))}
//                 {/* ✅ right offsets shifted: 360 / 240 / 120 / 0 for 4 columns */}
//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[360px] z-[90] min-w-[120px] h-[40px]">
//                   Total Invoice
//                 </TableHead>
//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[240px] z-[90] min-w-[120px] h-[40px]">
//                   Total Target
//                 </TableHead>
//                 {/* ✅ NEW Overall Achievement header */}
//                 <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[120px] z-[90] min-w-[120px] h-[40px]">
//                   Overall  Achievement
//                 </TableHead>
//                 <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-0 z-[90] min-w-[120px] h-[40px]">
//                   Total Achievement
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {kamPerformanceData.map((kam) => (
//                 <TableRow key={kam.id} className="hover:bg-muted/20">
//                   <TableCell className="font-medium border-r border-b bg-white sticky left-0 z-20">
//                     {kam.name}
//                   </TableCell>

//                   {kam.periodStats.map((stat: any, i: number) => (
//                     <React.Fragment key={i}>
//                       <TableCell className="text-center border-r border-b text-sm">
//                         {stat.clientCount}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.targetAmount)}
//                       </TableCell>
//                       <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.successAchieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(2)}%` : '0%'}
//                       </TableCell>
//                       <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>
//                         {formatCurrency(stat.achieved)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.selfAchieved)}
//                       </TableCell>
//                       <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.selfUpDown)}
//                       </TableCell>
//                       <TableCell className="text-center border-r border-b text-sm text-slate-600">
//                         {formatCurrency(stat.transferredAchieved)}
//                       </TableCell>
//                       <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {formatCurrency(stat.transferredUpDown)}
//                       </TableCell>
//                     </React.Fragment>
//                   ))}

//                   {/* ✅ right offsets: 360 / 240 / 120 / 0 */}
//                   <TableCell className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[360px] z-10 ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
//                     {formatCurrency(kam.rangeAchievedSum)}
//                   </TableCell>
//                   <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[240px] z-10">
//                     {formatCurrency(kam.rangeTargetSum)}
//                   </TableCell>
//                   {/* ✅ NEW Overall Achievement body cell */}
//                   <TableCell className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[120px] z-10 ${kam.overallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
//                     {formatCurrency(kam.overallAchievement)}
//                   </TableCell>
//                   <TableCell className={`text-center border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-0 z-10 ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
//                     {formatCurrency(kam.rangeSuccessAchievedSum)}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>

//             <TableFooter className="sticky bottom-0 z-[40] bg-slate-200">
//               <TableRow className="font-bold">
//                 <TableCell className="sticky left-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[180px]">
//                   GRAND TOTAL
//                 </TableCell>
//                 {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
//                   <TableCell key={i} className="border-t bg-slate-200" />
//                 ))}
//                 {/* ✅ right offsets: 360 / 240 / 120 / 0 */}
//                 <TableCell className="sticky right-[360px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
//                   {formatCurrency(footerTotals.totalInvoice)}
//                 </TableCell>
//                 <TableCell className="sticky right-[240px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
//                   {formatCurrency(footerTotals.totalTarget)}
//                 </TableCell>
//                 {/* ✅ NEW Overall Achievement footer cell */}
//                 <TableCell className={`sticky right-[120px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${footerTotals.totalOverallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
//                   {formatCurrency(footerTotals.totalOverallAchievement)}
//                 </TableCell>
//                 <TableCell className={`sticky right-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${footerTotals.totalAchievement >= footerTotals.totalTarget ? 'text-emerald-700' : 'text-destructive'}`}>
//                   {formatCurrency(footerTotals.totalAchievement)}
//                 </TableCell>
//               </TableRow>
//             </TableFooter>
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

      const firstPeriodAchievement = periodStats.length > 0 ? periodStats[0].achieved : 0;
      const lastPeriodAchievement  = periodStats.length > 0 ? periodStats[periodStats.length - 1].achieved : 0;
      const overallAchievement     = lastPeriodAchievement - firstPeriodAchievement;

      return {
        ...kam,
        periodStats,
        rangeTargetSum,
        rangeAchievedSum,
        rangeSuccessAchievedSum,
        overallAchievement,
      };
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
      acc.totalInvoice            += kam.rangeAchievedSum || 0;
      acc.totalTarget             += kam.rangeTargetSum || 0;
      acc.totalAchievement        += kam.rangeSuccessAchievedSum || 0;
      acc.totalOverallAchievement += kam.overallAchievement || 0;
      return acc;
    },
    { totalInvoice: 0, totalTarget: 0, totalAchievement: 0, totalOverallAchievement: 0 }
  );

  const SUB_HEADERS = [
    'Clients', 'Target', 'Achieved', 'Ach.%',
    'Invoice', 'Self', 'U/D Self',
    'Transfer', 'U/D Trans.',
  ];

  // Column order: Total Invoice | Overall  Achievement | Total Target | Total Achievement
  // right offsets (each col 120px wide):
  //   Total Achievement  → right-0
  //   Total Target       → right-[120px]
  //   Overall  Achievement    → right-[240px]
  //   Total Invoice      → right-[360px]

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
                  colSpan={4}
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
                {/* Order: Invoice | Overall | Target | Achiev. */}
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
                  Invoice
                </th>
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
                  Overall
                </th>
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-r border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
                  Target
                </th>
                <th className="sticky top-[33px] z-[10] bg-slate-200 border-b px-1.5 py-1.5 text-[9px] uppercase text-center whitespace-nowrap">
                  Achiev.
                </th>
              </tr>
            </thead>

            <tbody>
              {kamPerformanceData.map((kam, ki) => (
                <tr key={kam.id} className={ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>

                  <td
                    className={`sticky left-0 z-[20] border-r border-b px-2 py-2 font-medium min-w-[110px] max-w-[110px] whitespace-normal leading-tight text-[10px] ${ki % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                  >
                    {kam.name}
                  </td>

                  {/* Period data */}
                  {kam.periodStats.map((stat: any, si: number) => (
                    <React.Fragment key={si}>
                      <td className="border-r border-b px-1.5 py-1.5 text-center whitespace-nowrap">
                        {stat.clientCount}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
                        {formatCurrency(stat.targetAmount)}
                      </td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.successAchieved)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
                        {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {formatCurrency(stat.achieved)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
                        {formatCurrency(stat.selfAchieved)}
                      </td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.selfUpDown)}
                      </td>
                      <td className="border-r border-b px-1.5 py-1.5 text-center text-slate-600 whitespace-nowrap">
                        {formatCurrency(stat.transferredAchieved)}
                      </td>
                      <td className={`border-r border-b px-1.5 py-1.5 text-center font-semibold whitespace-nowrap ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.transferredUpDown)}
                      </td>
                    </React.Fragment>
                  ))}

                  {/* Row totals — Order: Invoice | Overall | Target | Achiev. */}
                  <td className={`border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.rangeAchievedSum)}
                  </td>
                  <td className={`border-r border-b px-1.5 py-1.5 text-center font-bold bg-slate-100 whitespace-nowrap ${kam.overallAchievement >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatCurrency(kam.overallAchievement)}
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
                <td className="sticky left-0 z-[10] bg-slate-300 border-t border-r px-2 py-2 text-[10px] font-bold min-w-[110px] whitespace-nowrap">
                  GRAND TOTAL
                </td>
                {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
                  <td key={i} className="border-t bg-slate-200 px-1.5 py-2" />
                ))}
                {/* Order: Invoice | Overall | Target | Achiev. */}
                <td className="border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap">
                  {formatCurrency(footerTotals.totalInvoice)}
                </td>
                <td className={`border-t border-r px-1.5 py-2 text-center bg-slate-300 whitespace-nowrap ${footerTotals.totalOverallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
                  {formatCurrency(footerTotals.totalOverallAchievement)}
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

        {/* ==================== DESKTOP (md+) ==================== */}
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
                  colSpan={4}
                  className="text-center bg-slate-200 border-b font-bold sticky right-0 top-0 z-[100] min-w-[480px] h-[40px]"
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
                {/* Order: Total Invoice | Overall  Achievement | Total Target | Total Achievement */}
                {/* right offsets: Invoice=360, Overall=240, Target=120, Achievement=0 */}
                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[360px] z-[90] min-w-[120px] h-[40px]">
                  Total Invoice
                </TableHead>
                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[240px] z-[90] min-w-[120px] h-[40px]">
                  Overall  Achievement
                </TableHead>
                <TableHead className="text-center border-r border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-[120px] z-[90] min-w-[120px] h-[40px]">
                  Total Target
                </TableHead>
                <TableHead className="text-center border-b text-[10px] uppercase bg-slate-200 sticky top-[40px] right-0 z-[90] min-w-[120px] h-[40px]">
                  Total  Target Achieved
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {kamPerformanceData.map((kam) => (
                <TableRow key={kam.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium border-r border-b bg-white sticky left-0 z-20">
                    {kam.name}
                  </TableCell>

                  {kam.periodStats.map((stat: any, i: number) => (
                    <React.Fragment key={i}>
                      <TableCell className="text-center border-r border-b text-sm">
                        {stat.clientCount}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.targetAmount)}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.successAchieved >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.successAchieved)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {stat.targetAmount > 0 ? `${((stat.successAchieved / stat.targetAmount) * 100).toFixed(2)}%` : '0%'}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.achieved >= stat.targetAmount ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {formatCurrency(stat.achieved)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.selfAchieved)}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.selfUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.selfUpDown)}
                      </TableCell>
                      <TableCell className="text-center border-r border-b text-sm text-slate-600">
                        {formatCurrency(stat.transferredAchieved)}
                      </TableCell>
                      <TableCell className={`text-center border-r border-b font-semibold text-sm ${stat.transferredUpDown >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(stat.transferredUpDown)}
                      </TableCell>
                    </React.Fragment>
                  ))}

                  {/* Order: Total Invoice | Overall  Achievement | Total Target | Total Achievement */}
                  <TableCell className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[360px] z-10 ${kam.rangeAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.rangeAchievedSum)}
                  </TableCell>
                  <TableCell className={`text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[240px] z-10 ${kam.overallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.overallAchievement)}
                  </TableCell>
                  <TableCell className="text-center border-r border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-[120px] z-10">
                    {formatCurrency(kam.rangeTargetSum)}
                  </TableCell>
                  <TableCell className={`text-center border-b font-bold bg-slate-50 text-sm min-w-[120px] sticky right-0 z-10 ${kam.rangeSuccessAchievedSum >= kam.rangeTargetSum ? 'text-emerald-700' : 'text-destructive'}`}>
                    {formatCurrency(kam.rangeSuccessAchievedSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="sticky bottom-0 z-[40] bg-slate-200">
              <TableRow className="font-bold">
                <TableCell className="sticky left-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[180px]">
                  GRAND TOTAL
                </TableCell>
                {Array.from({ length: tablePeriods.length * 9 }).map((_, i) => (
                  <TableCell key={i} className="border-t bg-slate-200" />
                ))}
                {/* Order: Total Invoice | Overall  Achievement | Total Target | Total Achievement */}
                <TableCell className="sticky right-[360px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
                  {formatCurrency(footerTotals.totalInvoice)}
                </TableCell>
                <TableCell className={`sticky right-[240px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${footerTotals.totalOverallAchievement >= 0 ? 'text-emerald-700' : 'text-destructive'}`}>
                  {formatCurrency(footerTotals.totalOverallAchievement)}
                </TableCell>
                <TableCell className="sticky right-[120px] bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center">
                  {formatCurrency(footerTotals.totalTarget)}
                </TableCell>
                <TableCell className={`sticky right-0 bottom-0 z-[300] bg-slate-300 border-t min-w-[120px] text-center ${footerTotals.totalAchievement >= footerTotals.totalTarget ? 'text-emerald-700' : 'text-destructive'}`}>
                  {formatCurrency(footerTotals.totalAchievement)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
};