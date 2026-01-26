// src/types/supervisor.ts
export interface Supervisor {
  id: number;
  name: string;
  division: string;
}

// Dummy Supervisor data
export const supervisors: Supervisor[] = [
  { id: 5, name: 'Rahim Uddin', division: 'Dhaka' },
  { id: 6, name: 'Karim Ahmed', division: 'Sylhet' },
  { id: 7, name: 'Hasan Mahmud', division: 'Dhaka' },
  { id: 8, name: 'Sabbir Hossain', division: 'Chittagong' },
];
