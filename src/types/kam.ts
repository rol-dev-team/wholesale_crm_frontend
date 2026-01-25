export interface KAM {
  id: number;
  name: string;
  division: string;
  supervisor_id: number;
  reportingTo?: string; // optional, can be supervisor name or user name
}

// Dummy KAM data
export const kams: KAM[] = [
  { id: 7, name: 'KAM A', division: 'Dhaka', supervisor_id: 5 },
  { id: 8, name: 'KAM B', division: 'Dhaka', supervisor_id: 7 },
  { id: 9, name: 'KAM C', division: 'Sylhet', supervisor_id: 6 },
  { id: 10, name: 'KAM D', division: 'Chittagong', supervisor_id: 8 },
];
