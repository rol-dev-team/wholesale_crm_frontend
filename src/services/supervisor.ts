// import { supervisors as dummySupervisors } from '@/types/supervisor';
// import type { Supervisor } from '@/types/supervisor';

// export const SupervisorService = {
//   getAll: (): Promise<Supervisor[]> => {
//     return Promise.resolve(dummySupervisors); // Return dummy supervisors as Promise
//   },
// };

// src/services/supervisor.ts

// import { supervisors as dummySupervisors } from '@/types/supervisor';

// export const SupervisorService = {
//   getAll: async () => {
//     return Promise.resolve(dummySupervisors);
//   },
// };

import { supervisors as dummySupervisors } from '@/types/supervisor';

export const SupervisorService = {
  getAll: async () => {
    return Promise.resolve(dummySupervisors); // promise return করবে API এর মতো
  },
};

