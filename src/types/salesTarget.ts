// src/types/salesTarget.ts
export interface SalesTarget {
  id: number;
  division: string;
  month: string;
  revenueTarget: number;
  revenueAchieved: number;
  kamId: number;
  supervisorId?: number;
}
