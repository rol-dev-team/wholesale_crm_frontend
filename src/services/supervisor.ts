// src/services/supervisor.ts
import { supervisors as dummySupervisors } from '@/types/supervisor';

export const SupervisorService = {
  getAll: async () => {
    return Promise.resolve(dummySupervisors); // promise return করবে API এর মতো
  },
};
